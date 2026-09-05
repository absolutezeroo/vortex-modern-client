/**
 * Tween / Juggler / TweenUtils
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/TweenUtils.as
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Tween.as
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Juggler.as
 *
 * The animation the login flow uses: `LoginFlow.onImageComplete()` fades each landing illustration
 * in over 1.2s, and `LoginFlow.onEnterFrame()` advances the shared juggler by the frame delta.
 *
 * It used to be the subset those two calls need; the whole of `Tween` landed on 2026-09-05 — the
 * callback surface and its argument arrays, the repeat/reverse/roundToInt knobs, `reset()`, the
 * read-back accessors, the convenience setters, and the property-hint machinery with its four
 * update paths (plain, RGB, radians, degrees). Two things are still not carried over and say why
 * at the declaration: the object pool, and the `REMOVE_FROM_JUGGLER` event the juggler polls for
 * instead. The engine has no counterpart to borrow — the animation package is unported elsewhere —
 * so this lives with the login display list, which is its only consumer today.
 *
 * The easing curves live in `Transitions.ts` next door, ported whole from AS3's own table.
 */
import type {DisplayObject} from './DisplayObject';
import {Transitions} from './Transitions';
import type {TransitionFunction} from './Transitions';

/** AS3: IAnimatable (_SafeCls_1977) — what a juggler can advance. */
export interface IAnimatable
{
    // AS3: function advanceTime(_arg_1:Number):void
    advanceTime(time: number): void;

    // TS-only: AS3 signals completion with a "REMOVE_FROM_JUGGLER" event; the port polls instead.
    readonly finished: boolean;
}

/** The signature of every per-property update function. */
// AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Tween.as::getUpdateFuncFromProperty()
type UpdateFunction = (property: string, startValue: number, endValue: number) => void;

/** What a tween may be pointed at: AS3 types the target `Object` and writes properties by name. */
// AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Tween.as::get target()
export type TweenTarget = DisplayObject;

/**
 * AS3: Tween — animates numeric properties of a target towards their end values.
 *
 * Ported whole on 2026-09-05; it used to be the slice `LoginFlow.onImageComplete()`'s fade needs.
 * Two things are deliberately not carried over, and both are Flash-shaped rather than behavioural:
 *
 * DEVIATION: AS3's `fromPool()`/`toPool()` recycle tweens through a static `Vector.<Tween>` — both
 *   are `internal`, and the only caller in the primary tree is `Juggler`'s own `tween()` helper,
 *   which nothing in this port uses. Allocating a small object per animation is not a cost worth a
 *   pool in a garbage-collected runtime, and a pooled tween that outlives its `reset()` is a class
 *   of bug the port has no reason to buy.
 * DEVIATION: AS3 signals completion by dispatching `REMOVE_FROM_JUGGLER` off `EventDispatcher`;
 *   this port's `Juggler` polls {@link finished} after each advance, which is the same removal at
 *   the same moment without an event class in between. `onComplete` still fires where AS3 fires it.
 */
export class Tween implements IAnimatable
{
    /** Separates a property name from its type hint: `"rotation#deg"`. */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Tween.as::HINT_MARKER
    private static readonly HINT_MARKER: string = '#';

    /*
     * Field names below. AS3's `Tween` is half readable and half obfuscated: nine fields survived
     * as `m`-prefixed names (`mTotalTime`, `mCurrentTime`, `mProgress`, `mProperties`,
     * `mStartValues`, `mEndValues`, `mOnUpdate`, `mTransitionName`, `mNextTween`) and are traced to
     * those; the other sixteen are `_SafeStr_N` and are named here after the **public accessor**
     * that reads them, which is readable in every case. Each says so and cites the accessor, so
     * nothing below is an invented name.
     */

    // Name DERIVED: AS3's `_SafeStr_6278`; named after the accessor that returns it.
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Tween.as::get target()
    private _target: TweenTarget;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Tween.as::mTotalTime
    private _totalTime: number = 0;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Tween.as::mCurrentTime
    private _currentTime: number = 0;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Tween.as::mProgress
    private _progress: number = 0;

    // Name DERIVED: AS3's `_SafeStr_7315`; named after the accessor that returns it.
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Tween.as::get delay()
    private _delay: number = 0;

    // Name DERIVED: AS3's `_SafeStr_7162`; named after the accessor that returns it.
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Tween.as::get repeatDelay()
    private _repeatDelay: number = 0;

    // Name DERIVED: AS3's `_SafeStr_5250`; named after the accessor that returns it.
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Tween.as::get repeatCount()
    private _repeatCount: number = 1;

    /**
     * Which pass this is, counting from -1 so the first advance can tell "not started yet" from
     * "cycle 0" — that is what gates `onStart` firing exactly once.
     *
     * Name DERIVED: AS3's `_SafeStr_5798` has no accessor at all; named after what `advanceTime()`
     * uses it for — the cycle counter it increments on start and on every repeat.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Tween.as::advanceTime()
    private _currentCycle: number = -1;

    // Name DERIVED: AS3's `_SafeStr_7113`; named after the accessor that returns it.
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Tween.as::get reverse()
    private _reverse: boolean = false;

    // Name DERIVED: AS3's `_SafeStr_7467`; named after the accessor that returns it.
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Tween.as::get roundToInt()
    private _roundToInt: boolean = false;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Tween.as::mNextTween
    private _nextTween: Tween | null = null;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Tween.as::mProperties
    private _properties: string[] = [];

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Tween.as::mStartValues
    private _startValues: number[] = [];

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Tween.as::mEndValues
    private _endValues: number[] = [];

    // Name DERIVED: AS3's `_SafeStr_7447` has no accessor; named after what `animate()` fills it
    // with — one update function per animated property.
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Tween.as::animate()
    private _updateFuncs: UpdateFunction[] = [];

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Tween.as::mTransitionName
    private _transitionName: string = 'linear';

    // Name DERIVED: AS3's `_SafeStr_6049`; named after the accessor that returns it.
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Tween.as::get transitionFunc()
    private _transitionFunc: TransitionFunction;

    // Name DERIVED: AS3's `_SafeStr_6240`; named after the accessor that returns it.
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Tween.as::get onStart()
    private _onStart: ((...args: unknown[]) => void) | null = null;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Tween.as::mOnUpdate
    private _onUpdate: ((...args: unknown[]) => void) | null = null;
    // Name DERIVED: AS3's `_SafeStr_6267`; named after the accessor that returns it.
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Tween.as::get onRepeat()
    private _onRepeat: ((...args: unknown[]) => void) | null = null;
    // Name DERIVED: AS3's `_SafeStr_6919`; named after the accessor that returns it.
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Tween.as::get onComplete()
    private _onComplete: ((...args: unknown[]) => void) | null = null;

    // Name DERIVED: AS3's `_SafeStr_6503`; named after the accessor that returns it.
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Tween.as::get onStartArgs()
    private _onStartArgs: unknown[] | null = null;
    // Name DERIVED: AS3's `_SafeStr_6715`; named after the accessor that returns it.
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Tween.as::get onUpdateArgs()
    private _onUpdateArgs: unknown[] | null = null;
    // Name DERIVED: AS3's `_SafeStr_6557`; named after the accessor that returns it.
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Tween.as::get onRepeatArgs()
    private _onRepeatArgs: unknown[] | null = null;
    // Name DERIVED: AS3's `_SafeStr_6635`; named after the accessor that returns it.
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Tween.as::get onCompleteArgs()
    private _onCompleteArgs: unknown[] | null = null;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Tween.as::Tween()
    constructor(target: TweenTarget, totalTime: number, transition: string | TransitionFunction = 'linear')
    {
        // Assigned here as well as in reset() only because TypeScript runs no definite-assignment
        // analysis through a method call; reset() is what actually sets them.
        this._target = target;
        this._transitionFunc = Transitions.getTransition('linear')!;

        this.reset(target, totalTime, transition);
    }

    /**
     * Puts the tween back to its initial state and re-points it.
     *
     * Returns `this` so AS3's pooled `fromPool()` can chain; nothing here pools, but a caller
     * re-using a tween wants the same chaining.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Tween.as::reset()
    public reset(target: TweenTarget, totalTime: number, transition: string | TransitionFunction = 'linear'): Tween
    {
        this._target = target;
        this._currentTime = 0;
        // AS3's floor: a zero-length tween would divide by zero on the very first advance.
        this._totalTime = Math.max(0.0001, totalTime);
        this._progress = 0;
        this._delay = 0;
        this._repeatDelay = 0;
        this._onStart = this._onUpdate = this._onRepeat = this._onComplete = null;
        this._onStartArgs = this._onUpdateArgs = this._onRepeatArgs = this._onCompleteArgs = null;
        this._roundToInt = false;
        this._reverse = false;
        this._repeatCount = 1;
        this._currentCycle = -1;
        this._nextTween = null;

        if(typeof transition === 'string') this.transition = transition;
        else this.transitionFunc = transition;

        this._properties = [];
        this._startValues = [];
        this._endValues = [];
        this._updateFuncs = [];

        return this;
    }

    /**
     * Queues one property to animate.
     *
     * The start value is deliberately left `NaN` and read off the target on the first advance, not
     * here: with a delay set, "where it started" means where the property was when the tween
     * actually began, which is not where it was when the tween was built.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Tween.as::animate()
    public animate(property: string, endValue: number): void
    {
        const index = this._properties.length;

        this._updateFuncs[index] = this.getUpdateFuncFromProperty(property);
        this._properties[index] = Tween.getPropertyName(property);
        this._startValues[index] = NaN;
        this._endValues[index] = endValue;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Tween.as::scaleTo()
    public scaleTo(factor: number): void
    {
        this.animate('scaleX', factor);
        this.animate('scaleY', factor);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Tween.as::moveTo()
    public moveTo(x: number, y: number): void
    {
        this.animate('x', x);
        this.animate('y', y);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Tween.as::fadeTo()
    public fadeTo(alpha: number): void
    {
        this.animate('alpha', alpha);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Tween.as::rotateTo()
    public rotateTo(angle: number, type: string = 'rad'): void
    {
        this.animate(`rotation${Tween.HINT_MARKER}${type}`, angle);
    }

    /**
     * Advances the animation, firing the callbacks whose moment this crosses.
     *
     * Ported instruction for instruction, including the tail recursion: when `time` overshoots the
     * end of a cycle the remainder is carried into the next one rather than dropped, which is what
     * keeps a repeating tween in phase on a laggy frame.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Tween.as::advanceTime()
    public advanceTime(time: number): void
    {
        if(time === 0 || (this._repeatCount === 1 && this._currentTime === this._totalTime)) return;

        const previousTime = this._currentTime;
        const restTime = this._totalTime - this._currentTime;
        let carryOverTime = time > restTime ? time - restTime : 0;

        this._currentTime += time;

        if(this._currentTime <= 0) return;
        if(this._currentTime > this._totalTime) this._currentTime = this._totalTime;

        if(this._currentCycle < 0 && previousTime <= 0 && this._currentTime > 0)
        {
            this._currentCycle++;
            // `.call(this, …)` rather than a bare call: AS3 uses `apply(this, args)`, so the
            // handler sees the tween as its receiver. Same for the three below.
            this._onStart?.call(this, ...(this._onStartArgs ?? []));
        }

        const ratio = this._currentTime / this._totalTime;
        const reversed = this._reverse && this._currentCycle % 2 === 1;

        this._progress = reversed ? this._transitionFunc(1 - ratio) : this._transitionFunc(ratio);

        for(let i = 0; i < this._startValues.length; i++)
        {
            // AS3's `!=` self-comparison is a NaN test — the marker `animate()` leaves behind.
            if(Number.isNaN(this._startValues[i]))
            {
                this._startValues[i] = (this._target as unknown as Record<string, number>)[this._properties[i]];
            }

            this._updateFuncs[i](this._properties[i], this._startValues[i], this._endValues[i]);
        }

        this._onUpdate?.call(this, ...(this._onUpdateArgs ?? []));

        if(previousTime < this._totalTime && this._currentTime >= this._totalTime)
        {
            // repeatCount 0 means forever; anything above 1 counts down.
            if(this._repeatCount === 0 || this._repeatCount > 1)
            {
                this._currentTime = -this._repeatDelay;
                this._currentCycle++;

                if(this._repeatCount > 1) this._repeatCount--;

                this._onRepeat?.call(this, ...(this._onRepeatArgs ?? []));
            }
            else
            {
                // Read both before the callback: AS3 snapshots them because the handler is free to
                // reset the tween, and a reset one must still call the handler it was holding.
                const onComplete = this._onComplete;
                const onCompleteArgs = this._onCompleteArgs;

                onComplete?.call(this, ...(onCompleteArgs ?? []));

                if(this._currentTime === 0) carryOverTime = 0;
            }
        }

        if(carryOverTime) this.advanceTime(carryOverTime);
    }

    /**
     * `"color"`/`"Color"` anywhere in the name means an RGB blend; anything after a `#` is an
     * explicit hint. Everything else is a plain number.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Tween.as::getPropertyHint()
    private static getPropertyHint(property: string): string | null
    {
        if(property.indexOf('color') !== -1 || property.indexOf('Color') !== -1) return 'rgb';

        const marker = property.indexOf(Tween.HINT_MARKER);

        return marker !== -1 ? property.substr(marker + 1) : null;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Tween.as::getPropertyName()
    private static getPropertyName(property: string): string
    {
        const marker = property.indexOf(Tween.HINT_MARKER);

        return marker !== -1 ? property.substring(0, marker) : property;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Tween.as::getUpdateFuncFromProperty()
    private getUpdateFuncFromProperty(property: string): UpdateFunction
    {
        switch(Tween.getPropertyHint(property))
        {
            case 'rgb': return this.updateRgb;
            case 'rad': return this.updateRad;
            case 'deg': return this.updateDeg;
            default: return this.updateStandard;
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Tween.as::updateStandard()
    private updateStandard = (property: string, startValue: number, endValue: number): void =>
    {
        let value = startValue + this._progress * (endValue - startValue);

        if(this._roundToInt) value = Math.round(value);

        (this._target as unknown as Record<string, number>)[property] = value;
    };

    /**
     * Blends two packed ARGB values channel by channel — interpolating the packed integers
     * directly would run the channels into each other.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Tween.as::updateRgb()
    private updateRgb = (property: string, startValue: number, endValue: number): void =>
    {
        const startA = (startValue >>> 24) & 0xFF;
        const startR = (startValue >>> 16) & 0xFF;
        const startG = (startValue >>> 8) & 0xFF;
        const startB = startValue & 0xFF;
        const endA = (endValue >>> 24) & 0xFF;
        const endR = (endValue >>> 16) & 0xFF;
        const endG = (endValue >>> 8) & 0xFF;
        const endB = endValue & 0xFF;

        // Truncated, not rounded: AS3 assigns each blend to a `uint`.
        const a = (startA + (endA - startA) * this._progress) >>> 0;
        const r = (startR + (endR - startR) * this._progress) >>> 0;
        const g = (startG + (endG - startG) * this._progress) >>> 0;
        const b = (startB + (endB - startB) * this._progress) >>> 0;

        (this._target as unknown as Record<string, number>)[property] = ((a << 24) | (r << 16) | (g << 8) | b) >>> 0;
    };

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Tween.as::updateRad()
    private updateRad = (property: string, startValue: number, endValue: number): void =>
    {
        this.updateAngle(Math.PI, property, startValue, endValue);
    };

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Tween.as::updateDeg()
    private updateDeg = (property: string, startValue: number, endValue: number): void =>
    {
        this.updateAngle(180, property, startValue, endValue);
    };

    /**
     * Walks the end angle into the half-turn nearest the start, so a rotation always takes the
     * short way round instead of unwinding the long way.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Tween.as::updateAngle()
    private updateAngle(halfTurn: number, property: string, startValue: number, endValue: number): void
    {
        let end = endValue;

        while(Math.abs(end - startValue) > halfTurn)
        {
            if(startValue < end) end -= 2 * halfTurn;
            else end += 2 * halfTurn;
        }

        this.updateStandard(property, startValue, end);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Tween.as::getEndValue()
    public getEndValue(property: string): number
    {
        const index = this._properties.indexOf(property);

        if(index === -1) throw new Error(`The property '${property}' is not animated`);

        return this._endValues[index];
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Tween.as::get isComplete()
    public get isComplete(): boolean
    {
        return this._currentTime >= this._totalTime && this._repeatCount === 1;
    }

    /**
     * DEVIATION: AS3 dispatches `REMOVE_FROM_JUGGLER` on completion and the juggler listens; this
     *   port's juggler polls instead, so completion has to be readable. It is `isComplete`.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Tween.as::get isComplete()
    public get finished(): boolean
    {
        return this.isComplete;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Tween.as::get target()
    public get target(): TweenTarget
    {
        return this._target;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Tween.as::get transition()
    public get transition(): string
    {
        return this._transitionName;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Tween.as::set transition()
    public set transition(value: string)
    {
        const func = Transitions.getTransition(value);

        if(!func) throw new Error(`Invalid transiton: ${value}`);

        this._transitionName = value;
        this._transitionFunc = func;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Tween.as::get transitionFunc()
    public get transitionFunc(): TransitionFunction
    {
        return this._transitionFunc;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Tween.as::set transitionFunc()
    public set transitionFunc(value: TransitionFunction)
    {
        this._transitionName = 'custom';
        this._transitionFunc = value;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Tween.as::get totalTime()
    public get totalTime(): number
    {
        return this._totalTime;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Tween.as::get currentTime()
    public get currentTime(): number
    {
        return this._currentTime;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Tween.as::get progress()
    public get progress(): number
    {
        return this._progress;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Tween.as::get delay()
    public get delay(): number
    {
        return this._delay;
    }

    /**
     * A delay is stored as *negative elapsed time*, not as a separate countdown: setting it moves
     * `_currentTime` back by the difference, so `advanceTime()` needs no delay branch at all.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Tween.as::set delay()
    public set delay(value: number)
    {
        this._currentTime = this._currentTime + this._delay - value;
        this._delay = value;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Tween.as::get repeatCount()
    public get repeatCount(): number
    {
        return this._repeatCount;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Tween.as::set repeatCount()
    public set repeatCount(value: number)
    {
        this._repeatCount = value;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Tween.as::get repeatDelay()
    public get repeatDelay(): number
    {
        return this._repeatDelay;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Tween.as::set repeatDelay()
    public set repeatDelay(value: number)
    {
        this._repeatDelay = value;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Tween.as::get reverse()
    public get reverse(): boolean
    {
        return this._reverse;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Tween.as::set reverse()
    public set reverse(value: boolean)
    {
        this._reverse = value;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Tween.as::get roundToInt()
    public get roundToInt(): boolean
    {
        return this._roundToInt;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Tween.as::set roundToInt()
    public set roundToInt(value: boolean)
    {
        this._roundToInt = value;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Tween.as::get onStart()
    public get onStart(): ((...args: unknown[]) => void) | null
    {
        return this._onStart;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Tween.as::set onStart()
    public set onStart(value: ((...args: unknown[]) => void) | null)
    {
        this._onStart = value;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Tween.as::get onUpdate()
    public get onUpdate(): ((...args: unknown[]) => void) | null
    {
        return this._onUpdate;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Tween.as::set onUpdate()
    public set onUpdate(value: ((...args: unknown[]) => void) | null)
    {
        this._onUpdate = value;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Tween.as::get onRepeat()
    public get onRepeat(): ((...args: unknown[]) => void) | null
    {
        return this._onRepeat;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Tween.as::set onRepeat()
    public set onRepeat(value: ((...args: unknown[]) => void) | null)
    {
        this._onRepeat = value;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Tween.as::get onComplete()
    public get onComplete(): ((...args: unknown[]) => void) | null
    {
        return this._onComplete;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Tween.as::set onComplete()
    public set onComplete(value: ((...args: unknown[]) => void) | null)
    {
        this._onComplete = value;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Tween.as::get onStartArgs()
    public get onStartArgs(): unknown[] | null
    {
        return this._onStartArgs;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Tween.as::set onStartArgs()
    public set onStartArgs(value: unknown[] | null)
    {
        this._onStartArgs = value;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Tween.as::get onUpdateArgs()
    public get onUpdateArgs(): unknown[] | null
    {
        return this._onUpdateArgs;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Tween.as::set onUpdateArgs()
    public set onUpdateArgs(value: unknown[] | null)
    {
        this._onUpdateArgs = value;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Tween.as::get onRepeatArgs()
    public get onRepeatArgs(): unknown[] | null
    {
        return this._onRepeatArgs;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Tween.as::set onRepeatArgs()
    public set onRepeatArgs(value: unknown[] | null)
    {
        this._onRepeatArgs = value;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Tween.as::get onCompleteArgs()
    public get onCompleteArgs(): unknown[] | null
    {
        return this._onCompleteArgs;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Tween.as::set onCompleteArgs()
    public set onCompleteArgs(value: unknown[] | null)
    {
        this._onCompleteArgs = value;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Tween.as::get nextTween()
    public get nextTween(): Tween | null
    {
        return this._nextTween;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Tween.as::set nextTween()
    public set nextTween(value: Tween | null)
    {
        this._nextTween = value;
    }
}

/**
 * AS3: Juggler — advances everything added to it.
 */
export class Juggler
{
    // AS3: _objects
    private _objects: IAnimatable[] = [];

    // AS3: add(_arg_1:IAnimatable)
    public add(animatable: IAnimatable): void
    {
        if(animatable && this._objects.indexOf(animatable) === -1)
        {
            this._objects.push(animatable);
        }
    }

    // AS3: remove(_arg_1:IAnimatable)
    public remove(animatable: IAnimatable): void
    {
        const index = this._objects.indexOf(animatable);

        if(index !== -1)
        {
            this._objects.splice(index, 1);
        }
    }

    /**
	 * Drops every tween animating `target`.
	 *
	 * This is what keeps a second animation on the same object from fighting the first: the
	 * caller removes what is running before adding its own. AS3 downcasts each member with
	 * `as Tween` and skips whatever is not one — a null in AS3, `instanceof` here — so a
	 * DelayedCall sharing the juggler is left alone.
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Juggler.as::removeTweens()
    public removeTweens(target: DisplayObject | null): void
    {
        if(target === null) return;

        this._objects = this._objects.filter(
            animatable => !(animatable instanceof Tween && animatable.target === target)
        );
    }

    /**
	 * Whether any tween is currently animating `target`.
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Juggler.as::containsTweens()
    public containsTweens(target: DisplayObject | null): boolean
    {
        if(target === null) return false;

        return this._objects.some(
            animatable => animatable instanceof Tween && animatable.target === target
        );
    }

    // AS3: advanceTime(_arg_1:Number)
    public advanceTime(time: number): void
    {
        if(this._objects.length === 0) return;

        for(const animatable of this._objects.slice())
        {
            animatable.advanceTime(time);
        }

        this._objects = this._objects.filter(animatable => !animatable.finished);
    }
}

/**
 * AS3: TweenUtils
 */
export class TweenUtils
{
    // AS3: FAST_ALPHA_TWEEN_TIME
    public static readonly FAST_ALPHA_TWEEN_TIME: number = 0.2;

    // AS3: STANDARD_ALPHA_TWEEN_TIME
    public static readonly STANDARD_ALPHA_TWEEN_TIME: number = 0.4;

    // AS3: SLOW_ALPHA_TWEEN_TIME_DOUBLE
    public static readonly SLOW_ALPHA_TWEEN_TIME_DOUBLE: number = 0.8;

    // AS3: REALLY_SLOW_ALPHA_TWEEN_TIME
    public static readonly REALLY_SLOW_ALPHA_TWEEN_TIME: number = 1.2;

    // AS3: STANDARD_ANCHOR_TWEEN_TIME
    public static readonly STANDARD_ANCHOR_TWEEN_TIME: number = 0.4;

    // AS3: juggler — the shared juggler every tween is added to.
    public static readonly JUGGLER: Juggler = new Juggler();

    /**
     * AS3: alphaTweenVisible(_arg_1:DisplayObject, _arg_2:Number, _arg_3:Number, _arg_4:String="linear")
     *
     * `_arg_2` is the DELAY, `_arg_3` the duration — the alpha is zeroed first, so a call with a
     * delay hides the object until the fade starts.
     */
    // AS3: .../src/com/sulake/habbo/utils/animation/TweenUtils.as::alphaTweenVisible()
    public static alphaTweenVisible(target: DisplayObject, delay: number, time: number, transition: string = 'linear'): Tween
    {
        target.alpha = 0;

        const tween = new Tween(target, time, transition);

        tween.animate('alpha', 1);
        tween.delay = delay;
        TweenUtils.JUGGLER.add(tween);

        return tween;
    }

    /**
     * AS3: alphaTweenInvisible(_arg_1:DisplayObject, _arg_2:Number, _arg_3:Number, _arg_4:String="linear")
     */
    // AS3: .../src/com/sulake/habbo/utils/animation/TweenUtils.as::alphaTweenInvisible()
    public static alphaTweenInvisible(target: DisplayObject, delay: number, time: number, transition: string = 'linear'): Tween
    {
        target.alpha = 1;

        const tween = new Tween(target, time, transition);

        tween.animate('alpha', 0);
        tween.delay = delay;
        TweenUtils.JUGGLER.add(tween);

        return tween;
    }

    /**
     * Fades in to 0.4, not to 1, on `easeOutBack` — the overshoot in that curve is what makes it
     * read as a blink rather than a fade. The transition is fixed, unlike the two above.
     */
    // AS3: .../src/com/sulake/habbo/utils/animation/TweenUtils.as::alphaTweenBlink()
    public static alphaTweenBlink(target: DisplayObject, delay: number, time: number): Tween
    {
        target.alpha = 0;

        const tween = new Tween(target, time, 'easeOutBack');

        tween.animate('alpha', 0.4);
        tween.delay = delay;
        TweenUtils.JUGGLER.add(tween);

        return tween;
    }
}

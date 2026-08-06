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
 * This is the subset those two calls need. The engine has no counterpart to borrow — the animation
 * package is unported — so it lives with the login display list, which is its only consumer.
 *
 * TODO(AS3): sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/animation/Transitions.as —
 * only "linear" is implemented. `alphaTweenBlink()` ("easeOutBack") and every eased call site
 * elsewhere in the client would need the full transition table.
 */
import type {DisplayObject} from './DisplayObject';

/** AS3: IAnimatable (_SafeCls_1977) — what a juggler can advance. */
export interface IAnimatable
{
    // AS3: function advanceTime(_arg_1:Number):void
    advanceTime(time: number): void;

    // TS-only: AS3 signals completion with a "REMOVE_FROM_JUGGLER" event; the port polls instead.
    readonly finished: boolean;
}

/**
 * AS3: Tween — animates one numeric property of a target towards a value.
 */
export class Tween implements IAnimatable
{
    // AS3: _target
    private readonly _target: DisplayObject;

    // AS3: _totalTime
    private readonly _totalTime: number;

    // AS3: _currentTime
    private _currentTime: number = 0;

    // AS3: delay
    public delay: number = 0;

    // AS3: _properties / _startValues / _endValues
    private readonly _properties: string[] = [];
    private readonly _startValues: number[] = [];
    private readonly _endValues: number[] = [];

    // AS3: Tween(_arg_1:Object, _arg_2:Number, _arg_3:String="linear")
    constructor(target: DisplayObject, totalTime: number, transition: string = 'linear')
    {
        this._target = target;
        this._totalTime = Math.max(0.0001, totalTime);

        if(transition !== 'linear')
        {
            // See the TODO in the file header — anything but linear runs linear here.
        }
    }

    // AS3: animate(_arg_1:String, _arg_2:Number)
    public animate(property: string, endValue: number): void
    {
        const start = (this._target as unknown as Record<string, number>)[property] ?? 0;

        this._properties.push(property);
        this._startValues.push(start);
        this._endValues.push(endValue);
    }

    // TS-only: whether the juggler should drop this tween — AS3 dispatches an event instead.
    public get finished(): boolean
    {
        return this._currentTime >= (this._totalTime + this.delay);
    }

    // AS3: advanceTime(_arg_1:Number)
    public advanceTime(time: number): void
    {
        this._currentTime += time;

        const elapsed = this._currentTime - this.delay;

        if(elapsed < 0) return;

        const ratio = Math.min(1, elapsed / this._totalTime);
        const target = this._target as unknown as Record<string, number>;

        for(let i = 0; i < this._properties.length; i++)
        {
            const start = this._startValues[i];
            const end = this._endValues[i];

            target[this._properties[i]] = start + (end - start) * ratio;
        }
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
}

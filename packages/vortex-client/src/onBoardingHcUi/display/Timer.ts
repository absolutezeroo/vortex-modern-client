/**
 * Timer for the login display list.
 *
 * TS-only: stand-in for `flash.utils.Timer`. Every login view schedules its layout pass through
 * one (`new Timer(20, 1)` in `onAddedToStage()`, so `LoaderUI`'s anchor helpers measure children
 * that have already been built), and `LoginFlow.showErrorMessage()` hides its balloon with a
 * 3-second one.
 */
import {DisplayEvent, EventDispatcher} from './DisplayObject';

export class Timer extends EventDispatcher
{
    private readonly _delay: number;
    private readonly _repeatCount: number;
    private _currentCount: number = 0;
    private _handle: number = 0;

    constructor(delay: number, repeatCount: number = 0)
    {
        super();

        this._delay = delay;
        this._repeatCount = repeatCount;
    }

    /** AS3: `get currentCount()`. */
    public get currentCount(): number
    {
        return this._currentCount;
    }

    /** AS3: `get running()`. */
    public get running(): boolean
    {
        return this._handle !== 0;
    }

    /** AS3: `start()`. */
    public start(): void
    {
        if(this._handle !== 0) return;

        this._handle = window.setInterval(() => this.tick(), this._delay);
    }

    /** AS3: `stop()`. */
    public stop(): void
    {
        if(this._handle === 0) return;

        window.clearInterval(this._handle);
        this._handle = 0;
    }

    /** AS3: `reset()`. */
    public reset(): void
    {
        this.stop();
        this._currentCount = 0;
    }

    /** TS-only: one interval step — fires `timer`, then `timerComplete` on the last repeat. */
    private tick(): void
    {
        this._currentCount++;

        this.dispatchEvent(new DisplayEvent('timer'));

        if(this._repeatCount > 0 && this._currentCount >= this._repeatCount)
        {
            this.stop();
            this.dispatchEvent(new DisplayEvent('timerComplete'));
        }
    }

    /** TS-only: stops the interval and drops the listeners. */
    public dispose(): void
    {
        this.stop();
        this.removeAllEventListeners();
    }
}

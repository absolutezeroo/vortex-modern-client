/**
 * CalendarItemWiggle — the one-shot bounce a calendar day plays when it is opened.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/campaign/calendar/CalendarItemWiggle.as
 *
 * The window is lifted by `LIFT_DISTANCE` on construction and then falls back to its original `y`,
 * overshooting a little less each time until `BOUNCE_COUNT` bounces have been counted. The step is
 * `sin()`-shaped rather than linear, and `Math.max(2, …)` keeps it from stalling at the top of the
 * arc where the sine approaches zero.
 *
 * The field names come from `sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/
 * campaign/calendar/CalendarItemWiggle.as`, which is unobfuscated; the three unnamed constants are
 * `_SafeStr_11069`/`_SafeStr_11560`/`_SafeStr_11464` in the primary tree and `_Str_14575`/
 * `_Str_18522`/`_Str_9823` in PRODUCTION, so their names below are **derived from their use**, not
 * recovered. `TIMER_INTERVAL` is the one the primary tree names itself.
 */
import type {IWindow} from '@core/window/IWindow';

export class CalendarItemWiggle
{
    // AS3: .../src/com/sulake/habbo/campaign/calendar/CalendarItemWiggle.as::TIMER_INTERVAL
    private static readonly TIMER_INTERVAL: number = 80;

    /** Derived name — `_SafeStr_11069`. How far above its resting `y` the window starts. */
    // AS3: .../src/com/sulake/habbo/campaign/calendar/CalendarItemWiggle.as::_SafeStr_11069
    private static readonly LIFT_DISTANCE: number = 10;

    /** Derived name — `_SafeStr_11560`. Scales the sine into pixels per tick. */
    // AS3: .../src/com/sulake/habbo/campaign/calendar/CalendarItemWiggle.as::_SafeStr_11560
    private static readonly SPEED: number = 40;

    /** Derived name — `_SafeStr_11464`. Bounces counted before the animation disposes itself. */
    // AS3: .../src/com/sulake/habbo/campaign/calendar/CalendarItemWiggle.as::_SafeStr_11464
    private static readonly BOUNCE_COUNT: number = 7;

    // AS3: .../src/com/sulake/habbo/campaign/calendar/CalendarItemWiggle.as::_window
    private _window: IWindow | null = null;

    /**
     * AS3 holds a `flash.utils.Timer`; the browser equivalent is an interval handle. `reset()`
     * becomes `clearInterval()` — the timer is never restarted, so `stop()`/`reset()` do not differ
     * here.
     */
    // AS3: .../src/com/sulake/habbo/campaign/calendar/CalendarItemWiggle.as::_timer
    private _timer: ReturnType<typeof setInterval> | null = null;

    // AS3: .../src/com/sulake/habbo/campaign/calendar/CalendarItemWiggle.as::_direction
    private _direction: number = 0;

    // AS3: .../src/com/sulake/habbo/campaign/calendar/CalendarItemWiggle.as::_counter
    private _counter: number = 0;

    // AS3: .../src/com/sulake/habbo/campaign/calendar/CalendarItemWiggle.as::_initialY
    private _initialY: number = 0;

    // AS3: .../src/com/sulake/habbo/campaign/calendar/CalendarItemWiggle.as::CalendarItemWiggle()
    constructor(window: IWindow | null)
    {
        if(!window) return;

        this._window = window;
        this._initialY = window.y;

        window.y -= CalendarItemWiggle.LIFT_DISTANCE;

        this._direction = 1;
        this._timer = setInterval(this.onTimerEvent, CalendarItemWiggle.TIMER_INTERVAL);
    }

    // AS3: .../src/com/sulake/habbo/campaign/calendar/CalendarItemWiggle.as::onTimerEvent()
    private onTimerEvent = (): void =>
    {
        // AS3 calls dispose() here and then keeps going, so a null window faults on the next line —
        // in Flash as much as here. It is unreachable: the constructor returns before starting the
        // timer when there is no window, and dispose() clears the timer.
        if(!this._window)
        {
            this.dispose();
        }

        const window = this._window!;

        const amplitude = CalendarItemWiggle.LIFT_DISTANCE
            * ((CalendarItemWiggle.BOUNCE_COUNT - this._counter) / CalendarItemWiggle.BOUNCE_COUNT);
        const phase = Math.abs(window.y - this._initialY) / amplitude;
        const step = Math.max(2, Math.sin(phase) * CalendarItemWiggle.SPEED) * this._direction;

        window.y += step;

        if(this._direction > 0)
        {
            if(window.y > this._initialY)
            {
                this._direction *= -1;
                window.y = this._initialY;
                this._counter = this._counter + 1;
            }
        }
        else if(window.y <= this._initialY - amplitude)
        {
            this._direction *= -1;
            window.y = this._initialY - amplitude;
            this._counter = this._counter + 1;
        }

        if(this._counter >= CalendarItemWiggle.BOUNCE_COUNT)
        {
            this.dispose();
        }
    };

    // AS3: .../src/com/sulake/habbo/campaign/calendar/CalendarItemWiggle.as::dispose()
    private dispose(): void
    {
        this._window!.y = this._initialY;
        this._window = null;

        if(this._timer !== null)
        {
            clearInterval(this._timer);
            this._timer = null;
        }
    }
}

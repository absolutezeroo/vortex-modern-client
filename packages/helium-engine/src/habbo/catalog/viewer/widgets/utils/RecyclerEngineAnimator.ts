import type {IDisposable} from '@core/runtime/IDisposable';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';

const MIN_ANGLE = -88;
const MAX_ANGLE = 88;
const SHAKE_THRESHOLD_ANGLE = 82;
const PRE_FINISH_ANGLE_THRESHOLD = 68;
const ANGLE_BUFFER = 5;
const RANDOM_BIAS_SLOPE = 0.00008;
const BASE_BIAS = 0.35;
const FIRST_BIAS = 0.2;
const TICK_INTERVAL_MS = 16;
const RESET_TIME = 250;
const SHAKE_TIMEOUT = 50;
const SHAKE_PIXELS = 3;
const MIN_TIME_ACTIVE = 3000;
const SHAKE_PIXELS_EASTER_EGG = 24;
const STEP_SIZE_EASTER_EGG = 70;
const STEP_DURATION_EASTER_EGG = 20;
const TOTAL_DURATION_EASTER_EGG = 5000;
const STEP_DURATION_MIN = 400;
const STEP_DURATION_MAX = 200;
const STEP_SIZE_MIN = 20;
const STEP_SIZE_MAX = 55;

/**
 * Drives the recycler machine's pointer-arrow spin animation (normal + "easter egg" mode).
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/utils/RecyclerEngineAnimator.as
 */
export class RecyclerEngineAnimator implements IDisposable
{
    private _arrow: IStaticBitmapWrapperWindow | null;

    private _recycleMachine: IStaticBitmapWrapperWindow | null;

    private _onFinish: (() => void) | null;

    private _startTime: number = 0;

    private _stepBeginTime: number = 0;

    private _fromAngle: number = 0;

    private _toAngle: number = 0;

    private _animationTime: number = 0;

    private _shakeLastTime: number = 0;

    private _timer: ReturnType<typeof setInterval> | null = null;

    private _resetting: boolean = false;

    private _baseX: number;

    private _baseY: number;

    private _easterEggMode: boolean = false;

    private _disposed: boolean = false;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/utils/RecyclerEngineAnimator.as::RecyclerEngineAnimator()
    constructor(arrow: IStaticBitmapWrapperWindow, recycleMachine: IStaticBitmapWrapperWindow, onFinish: () => void)
    {
        this._arrow = arrow;
        this._recycleMachine = recycleMachine;
        this._baseX = recycleMachine.x;
        this._baseY = recycleMachine.y;
        this._onFinish = onFinish;
        this.setRotation(0);
    }

    private static rand(min: number, max: number): number
    {
        return min + Math.random() * (max - min);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/utils/RecyclerEngineAnimator.as::start()
    start(easterEggMode: boolean = false): void
    {
        this.stopTimer();
        this._resetting = false;
        this._easterEggMode = easterEggMode;
        this._startTime = performance.now();
        this.setRotation(0);
        this.setShake(0, 0);
        this.nextStep(false, true);
        this.startTimer();
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/utils/RecyclerEngineAnimator.as::stop()
    stop(): void
    {
        this.stopTimer();
        this.setShake(0, 0);
        this._resetting = false;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/utils/RecyclerEngineAnimator.as::reset()
    reset(): void
    {
        this.stopTimer();
        this._resetting = true;
        this._fromAngle = this._arrow?.rotation ?? 0;
        this.setRotation(this._fromAngle % 360);
        this._toAngle = 0;
        this._stepBeginTime = performance.now();
        this._animationTime = RESET_TIME;
        this.setShake(0, 0);
        this.startTimer();
    }

    private startTimer(): void
    {
        this._timer = setInterval(() => this.onTimerTick(), TICK_INTERVAL_MS);
    }

    private stopTimer(): void
    {
        if(this._timer != null)
        {
            clearInterval(this._timer);
            this._timer = null;
        }
    }

    private setRotation(angle: number): void
    {
        if(!this._arrow) return;

        this._arrow.rotation = angle;
        this._arrow.invalidate();
    }

    private setShake(dx: number, dy: number): void
    {
        if(!this._recycleMachine) return;

        this._recycleMachine.x = this._baseX + dx;
        this._recycleMachine.y = this._baseY + dy;
    }

    private onTimerTick(): void
    {
        const now = performance.now();
        const elapsedInStep = now - this._stepBeginTime;
        const progress = Math.max(0, Math.min(1, elapsedInStep / this._animationTime));
        const angle = (this._toAngle - this._fromAngle) * progress + this._fromAngle;

        this.setRotation(angle);

        if(this.isBusy() && now > this._shakeLastTime + SHAKE_TIMEOUT)
        {
            this._shakeLastTime = now;

            const shakePixels = this._easterEggMode ? SHAKE_PIXELS_EASTER_EGG : SHAKE_PIXELS;

            this.setShake(RecyclerEngineAnimator.rand(-shakePixels, shakePixels), RecyclerEngineAnimator.rand(-shakePixels, shakePixels));
        }

        if(elapsedInStep >= this._animationTime)
        {
            if(this._resetting)
            {
                this.stopTimer();
                this._resetting = false;
            }
            else if((angle >= SHAKE_THRESHOLD_ANGLE && !this._easterEggMode && now - this._startTime > MIN_TIME_ACTIVE)
                || (this._easterEggMode && now - this._startTime > TOTAL_DURATION_EASTER_EGG))
            {
                this.stopTimer();
                this.setShake(0, 0);
                this._onFinish?.();
            }
            else
            {
                this.nextStep(angle >= PRE_FINISH_ANGLE_THRESHOLD && now - this._startTime > MIN_TIME_ACTIVE - 300 && !this._easterEggMode);
            }
        }
    }

    private nextStep(finishStep: boolean = false, firstStep: boolean = false): void
    {
        this._fromAngle = this._arrow?.rotation ?? 0;
        this._stepBeginTime = performance.now();

        if(finishStep)
        {
            this._toAngle = MAX_ANGLE;
        }
        else if(this._easterEggMode)
        {
            this._toAngle = this._fromAngle - STEP_SIZE_EASTER_EGG;
        }
        else
        {
            const elapsedSinceStart = performance.now() - this._startTime;
            let reverse: boolean;

            if(this._fromAngle <= MIN_ANGLE + ANGLE_BUFFER)
            {
                reverse = false;
            }
            else if(this._fromAngle >= MAX_ANGLE - ANGLE_BUFFER)
            {
                reverse = true;
            }
            else
            {
                const bias = firstStep ? FIRST_BIAS : BASE_BIAS + elapsedSinceStart * RANDOM_BIAS_SLOPE;

                reverse = Math.random() > bias;
            }

            const step = (reverse ? -1 : 1) * RecyclerEngineAnimator.rand(STEP_SIZE_MIN, STEP_SIZE_MAX);

            this._toAngle = Math.max(MIN_ANGLE, Math.min(MAX_ANGLE, this._fromAngle + step));
        }

        this._animationTime = this._easterEggMode ? STEP_DURATION_EASTER_EGG : RecyclerEngineAnimator.rand(STEP_DURATION_MIN, STEP_DURATION_MAX);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/utils/RecyclerEngineAnimator.as::isBusy()
    isBusy(): boolean
    {
        return this._timer != null && !this._resetting;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/utils/RecyclerEngineAnimator.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;

        this.stopTimer();
        this._arrow = null;
        this._recycleMachine = null;
        this._onFinish = null;
        this._disposed = true;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/utils/RecyclerEngineAnimator.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }
}

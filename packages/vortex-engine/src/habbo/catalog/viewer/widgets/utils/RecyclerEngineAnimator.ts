import type {IDisposable} from '@core/runtime/IDisposable';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';

/**
 * Drives the recycler machine's pointer-arrow spin animation (normal + "easter egg" mode).
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/utils/RecyclerEngineAnimator.as
 */
export class RecyclerEngineAnimator implements IDisposable
{
    // Derived name: `_SafeStr_10746` is obfuscated in every tree; named after its role.
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/utils/RecyclerEngineAnimator.as::MIN_ANGLE
    private static readonly MIN_ANGLE = -88;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/utils/RecyclerEngineAnimator.as::MAX_ANGLE
    private static readonly MAX_ANGLE = 88;

    // Derived name: `_SafeStr_10736` is obfuscated in every tree; named after its role.
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/utils/RecyclerEngineAnimator.as::SHAKE_THRESHOLD_ANGLE
    private static readonly SHAKE_THRESHOLD_ANGLE = 82;

    // Derived name: `_SafeStr_11050` is obfuscated in every tree; named after its role.
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/utils/RecyclerEngineAnimator.as::PRE_FINISH_ANGLE_THRESHOLD
    private static readonly PRE_FINISH_ANGLE_THRESHOLD = 68;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/utils/RecyclerEngineAnimator.as::ANGLE_BUFFER
    private static readonly ANGLE_BUFFER = 5;

    // Derived name: `_SafeStr_10851` is obfuscated in every tree; named after its role.
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/utils/RecyclerEngineAnimator.as::RANDOM_BIAS_SLOPE
    private static readonly RANDOM_BIAS_SLOPE = 0.00008;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/utils/RecyclerEngineAnimator.as::BASE_BIAS
    private static readonly BASE_BIAS = 0.35;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/utils/RecyclerEngineAnimator.as::FIRST_BIAS
    private static readonly FIRST_BIAS = 0.2;

    // Derived name: `_SafeStr_11512` is obfuscated in every tree; named after its role.
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/utils/RecyclerEngineAnimator.as::TICK_INTERVAL_MS
    private static readonly TICK_INTERVAL_MS = 16;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/utils/RecyclerEngineAnimator.as::RESET_TIME
    private static readonly RESET_TIME = 250;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/utils/RecyclerEngineAnimator.as::SHAKE_TIMEOUT
    private static readonly SHAKE_TIMEOUT = 50;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/utils/RecyclerEngineAnimator.as::SHAKE_PIXELS
    private static readonly SHAKE_PIXELS = 3;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/utils/RecyclerEngineAnimator.as::MIN_TIME_ACTIVE
    private static readonly MIN_TIME_ACTIVE = 3000;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/utils/RecyclerEngineAnimator.as::SHAKE_PIXELS_E
    // (and STEP_SIZE_E / STEP_DURATION_E / TOTAL_DURATION_E) — the `_E` suffix is AS3's own
    // spelling for the easter-egg variants, read only when `_easterEggMode` is set.
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/utils/RecyclerEngineAnimator.as::SHAKE_PIXELS_E
    private static readonly SHAKE_PIXELS_E = 24;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/utils/RecyclerEngineAnimator.as::STEP_SIZE_E
    private static readonly STEP_SIZE_E = 70;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/utils/RecyclerEngineAnimator.as::STEP_DURATION_E
    private static readonly STEP_DURATION_E = 20;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/utils/RecyclerEngineAnimator.as::TOTAL_DURATION_E
    private static readonly TOTAL_DURATION_E = 5000;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/utils/RecyclerEngineAnimator.as::STEP_DURATION_MIN
    private static readonly STEP_DURATION_MIN = 400;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/utils/RecyclerEngineAnimator.as::STEP_DURATION_MAX
    private static readonly STEP_DURATION_MAX = 200;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/utils/RecyclerEngineAnimator.as::STEP_SIZE_MIN
    private static readonly STEP_SIZE_MIN = 20;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/viewer/widgets/utils/RecyclerEngineAnimator.as::STEP_SIZE_MAX
    private static readonly STEP_SIZE_MAX = 55;

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/utils/RecyclerEngineAnimator.as::_arrow
    private _arrow: IStaticBitmapWrapperWindow | null;

    private _recycleMachine: IStaticBitmapWrapperWindow | null;

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/utils/RecyclerEngineAnimator.as::_onFinish
    private _onFinish: (() => void) | null;

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/utils/RecyclerEngineAnimator.as::_startTime
    private _startTime: number = 0;

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/utils/RecyclerEngineAnimator.as::_stepBeginTime
    private _stepBeginTime: number = 0;

    private _fromAngle: number = 0;

    private _toAngle: number = 0;

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/utils/RecyclerEngineAnimator.as::_animationTime
    private _animationTime: number = 0;

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/utils/RecyclerEngineAnimator.as::_shakeLastTime
    private _shakeLastTime: number = 0;

    private _timer: ReturnType<typeof setInterval> | null = null;

    private _resetting: boolean = false;

    private _baseX: number;

    private _baseY: number;

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/utils/RecyclerEngineAnimator.as::_easterEggMode
    private _easterEggMode: boolean = false;

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/utils/RecyclerEngineAnimator.as::_disposed
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

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/utils/RecyclerEngineAnimator.as::rand()
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
        this._animationTime = RecyclerEngineAnimator.RESET_TIME;
        this.setShake(0, 0);
        this.startTimer();
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/utils/RecyclerEngineAnimator.as::startTimer()
    private startTimer(): void
    {
        this._timer = setInterval(() => this.onTimerTick(), RecyclerEngineAnimator.TICK_INTERVAL_MS);
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/utils/RecyclerEngineAnimator.as::stopTimer()
    private stopTimer(): void
    {
        if(this._timer != null)
        {
            clearInterval(this._timer);
            this._timer = null;
        }
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/utils/RecyclerEngineAnimator.as::setRotation()
    private setRotation(angle: number): void
    {
        if(!this._arrow) return;

        this._arrow.rotation = angle;
        this._arrow.invalidate();
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/utils/RecyclerEngineAnimator.as::setShake()
    private setShake(dx: number, dy: number): void
    {
        if(!this._recycleMachine) return;

        this._recycleMachine.x = this._baseX + dx;
        this._recycleMachine.y = this._baseY + dy;
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/utils/RecyclerEngineAnimator.as::onTimerTick()
    private onTimerTick(): void
    {
        const now = performance.now();
        const elapsedInStep = now - this._stepBeginTime;
        const progress = Math.max(0, Math.min(1, elapsedInStep / this._animationTime));
        const angle = (this._toAngle - this._fromAngle) * progress + this._fromAngle;

        this.setRotation(angle);

        if(this.isBusy() && now > this._shakeLastTime + RecyclerEngineAnimator.SHAKE_TIMEOUT)
        {
            this._shakeLastTime = now;

            const shakePixels = this._easterEggMode ? RecyclerEngineAnimator.SHAKE_PIXELS_E : RecyclerEngineAnimator.SHAKE_PIXELS;

            this.setShake(RecyclerEngineAnimator.rand(-shakePixels, shakePixels), RecyclerEngineAnimator.rand(-shakePixels, shakePixels));
        }

        if(elapsedInStep >= this._animationTime)
        {
            if(this._resetting)
            {
                this.stopTimer();
                this._resetting = false;
            }
            else if((angle >= RecyclerEngineAnimator.SHAKE_THRESHOLD_ANGLE && !this._easterEggMode && now - this._startTime > RecyclerEngineAnimator.MIN_TIME_ACTIVE)
                || (this._easterEggMode && now - this._startTime > RecyclerEngineAnimator.TOTAL_DURATION_E))
            {
                this.stopTimer();
                this.setShake(0, 0);
                this._onFinish?.();
            }
            else
            {
                this.nextStep(angle >= RecyclerEngineAnimator.PRE_FINISH_ANGLE_THRESHOLD && now - this._startTime > RecyclerEngineAnimator.MIN_TIME_ACTIVE - 300 && !this._easterEggMode);
            }
        }
    }

    // AS3: .../src/com/sulake/habbo/catalog/viewer/widgets/utils/RecyclerEngineAnimator.as::nextStep()
    private nextStep(finishStep: boolean = false, firstStep: boolean = false): void
    {
        this._fromAngle = this._arrow?.rotation ?? 0;
        this._stepBeginTime = performance.now();

        if(finishStep)
        {
            this._toAngle = RecyclerEngineAnimator.MAX_ANGLE;
        }
        else if(this._easterEggMode)
        {
            this._toAngle = this._fromAngle - RecyclerEngineAnimator.STEP_SIZE_E;
        }
        else
        {
            const elapsedSinceStart = performance.now() - this._startTime;
            let reverse: boolean;

            if(this._fromAngle <= RecyclerEngineAnimator.MIN_ANGLE + RecyclerEngineAnimator.ANGLE_BUFFER)
            {
                reverse = false;
            }
            else if(this._fromAngle >= RecyclerEngineAnimator.MAX_ANGLE - RecyclerEngineAnimator.ANGLE_BUFFER)
            {
                reverse = true;
            }
            else
            {
                const bias = firstStep ? RecyclerEngineAnimator.FIRST_BIAS : RecyclerEngineAnimator.BASE_BIAS + elapsedSinceStart * RecyclerEngineAnimator.RANDOM_BIAS_SLOPE;

                reverse = Math.random() > bias;
            }

            const step = (reverse ? -1 : 1) * RecyclerEngineAnimator.rand(RecyclerEngineAnimator.STEP_SIZE_MIN, RecyclerEngineAnimator.STEP_SIZE_MAX);

            this._toAngle = Math.max(RecyclerEngineAnimator.MIN_ANGLE, Math.min(RecyclerEngineAnimator.MAX_ANGLE, this._fromAngle + step));
        }

        this._animationTime = this._easterEggMode ? RecyclerEngineAnimator.STEP_DURATION_E : RecyclerEngineAnimator.rand(RecyclerEngineAnimator.STEP_DURATION_MIN, RecyclerEngineAnimator.STEP_DURATION_MAX);
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

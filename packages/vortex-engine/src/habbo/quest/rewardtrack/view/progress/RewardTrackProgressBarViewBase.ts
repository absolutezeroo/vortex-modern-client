/**
 * RewardTrackProgressBarViewBase — a progress bar that eases toward its target rather than jumping.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/quest/rewardtrack/view/progress/RewardTrackProgressBarViewBase.as
 *
 * The fill is an `AnimatedScalar` under constant acceleration, so `setRatio(x, true)` starts a glide
 * and `setRatio(x, false)` snaps. `update()` returns early unless something actually moved, which is
 * what keeps an idle bar off the render path.
 *
 * The `tracksCompletion` flag (AS3's second constructor argument) adds a second animation: the
 * `loading_bar` child cross-fades between amber and green as the ratio crosses 1. Only the task
 * bars ask for it; the main bar does not.
 */
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import {AnimatedColor} from '@habbo/window/utils/AnimatedColor';
import {AnimatedScalar} from '@habbo/window/utils/AnimatedScalar';

export class RewardTrackProgressBarViewBase
{
    // AS3: RewardTrackProgressBarViewBase.as::ACCELERATION_PER_MS
    private static readonly ACCELERATION_PER_MS: number = 0.00001;

    // AS3: RewardTrackProgressBarViewBase.as::MAX_SPEED_PER_MS
    private static readonly MAX_SPEED_PER_MS: number = 0.003;

    /** Derived name — `_SafeStr_11080`: the scalar's settle tolerance. */
    // AS3: RewardTrackProgressBarViewBase.as::_SafeStr_11080
    private static readonly SETTLE_TOLERANCE: number = 0.0001;

    // AS3: RewardTrackProgressBarViewBase.as::FILL_COLOR_TRANSITION_MS
    private static readonly FILL_COLOR_TRANSITION_MS: number = 300;

    /** AS3's `uint` literal 15443468. */
    // AS3: RewardTrackProgressBarViewBase.as::INCOMPLETE_COLOR
    private static readonly INCOMPLETE_COLOR: number = 0xEBA60C;

    /** AS3's `uint` literal 7450404. */
    // AS3: RewardTrackProgressBarViewBase.as::COMPLETE_COLOR
    private static readonly COMPLETE_COLOR: number = 0x71AF24;

    // AS3: RewardTrackProgressBarViewBase.as::_container
    protected _container: IWindowContainer | null;

    /** Derived name — `_SafeStr_6031`: the filled part of the bar. */
    // AS3: RewardTrackProgressBarViewBase.as::_SafeStr_6031
    protected _progress: IWindowContainer | null;

    /** Derived name — `_SafeStr_5839`: the eased fill ratio. */
    // AS3: RewardTrackProgressBarViewBase.as::_SafeStr_5839
    protected _ratio: AnimatedScalar | null;

    /** Derived name — `_SafeStr_5426`: milliseconds accumulated by `update()`. */
    // AS3: RewardTrackProgressBarViewBase.as::_SafeStr_5426
    protected _elapsedMs: number = 0;

    /** Derived name — `_SafeStr_8071`: the child whose colour tracks completion. */
    // AS3: RewardTrackProgressBarViewBase.as::_SafeStr_8071
    private _loadingBar: IWindow | null = null;

    // AS3: RewardTrackProgressBarViewBase.as::_completionColor
    private _completionColor: AnimatedColor | null = null;

    // AS3: RewardTrackProgressBarViewBase.as::_maxWidth
    private _maxWidth: number;

    /** Derived name — `_SafeStr_6645`: whether this bar cross-fades on completion. */
    // AS3: RewardTrackProgressBarViewBase.as::_SafeStr_6645
    private _tracksCompletion: boolean;

    // AS3: RewardTrackProgressBarViewBase.as::_disposed
    private _disposed: boolean = false;

    // AS3: RewardTrackProgressBarViewBase.as::RewardTrackProgressBarViewBase()
    constructor(container: IWindowContainer, tracksCompletion: boolean = false)
    {
        this._container = container;
        this._progress = container.findChildByName('progress') as IWindowContainer | null;
        this._maxWidth = (container as unknown as IWindow).width;
        this._tracksCompletion = tracksCompletion;

        this._ratio = new AnimatedScalar(
            RewardTrackProgressBarViewBase.ACCELERATION_PER_MS,
            RewardTrackProgressBarViewBase.MAX_SPEED_PER_MS,
            RewardTrackProgressBarViewBase.SETTLE_TOLERANCE
        );

        if(this._tracksCompletion)
        {
            this._loadingBar = this._progress?.findChildByName('loading_bar') ?? null;
            this._completionColor = new AnimatedColor(RewardTrackProgressBarViewBase.FILL_COLOR_TRANSITION_MS);
            this._completionColor.snapTo(RewardTrackProgressBarViewBase.INCOMPLETE_COLOR, this._elapsedMs);
        }
    }

    // AS3: RewardTrackProgressBarViewBase.as::setRatio()
    public setRatio(ratio: number, animate: boolean): void
    {
        const clamped = RewardTrackProgressBarViewBase.clampRatio(ratio);

        if(animate)
        {
            this._ratio?.setTarget(clamped, this._elapsedMs);
        }
        else
        {
            this._ratio?.snapTo(clamped, this._elapsedMs);
        }

        this.syncCompletionColor(animate);
        this.render();
    }

    /** Renders only when something moved — `AnimatedScalar.update()` reports that. */
    // AS3: RewardTrackProgressBarViewBase.as::update()
    public update(deltaMs: number): void
    {
        this._elapsedMs += deltaMs;

        let moved = this._ratio?.update(this._elapsedMs) ?? false;

        if(this._tracksCompletion)
        {
            this.syncCompletionColor(true);

            moved = (this._completionColor?.update(this._elapsedMs) ?? false) || moved;
        }

        if(moved)
        {
            this.render();
        }
    }

    // AS3: RewardTrackProgressBarViewBase.as::get isUpdating()
    public get isUpdating(): boolean
    {
        return (this._ratio?.needsUpdate(this._elapsedMs, this._maxWidth) ?? false)
            || (this._tracksCompletion && (this._completionColor?.needsUpdate(this._elapsedMs) ?? false));
    }

    // AS3: RewardTrackProgressBarViewBase.as::render()
    protected render(): void
    {
        const progress = this._progress as unknown as IWindow | null;

        if(progress !== null)
        {
            progress.width = Math.max(
                0, Math.min(this._maxWidth, Math.round(this._maxWidth * (this._ratio?.value ?? 0)))
            );
        }

        if(this._tracksCompletion && this._loadingBar !== null && this._completionColor !== null)
        {
            this._loadingBar.color = this._completionColor.value;
        }
    }

    // AS3: RewardTrackProgressBarViewBase.as::clampRatio()
    protected static clampRatio(ratio: number): number
    {
        return Math.max(0, Math.min(1, ratio));
    }

    // AS3: RewardTrackProgressBarViewBase.as::syncCompletionColor()
    private syncCompletionColor(animate: boolean): void
    {
        if(!this._tracksCompletion || this._completionColor === null) return;

        const target = (this._ratio?.value ?? 0) >= 1
            ? RewardTrackProgressBarViewBase.COMPLETE_COLOR
            : RewardTrackProgressBarViewBase.INCOMPLETE_COLOR;

        if(animate)
        {
            this._completionColor.setTarget(target, this._elapsedMs);
        }
        else
        {
            this._completionColor.snapTo(target, this._elapsedMs);
        }
    }

    // AS3: RewardTrackProgressBarViewBase.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: RewardTrackProgressBarViewBase.as::dispose()
    public dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;
        this._container = null;
        this._progress = null;
        this._ratio = null;
        this._loadingBar = null;
        this._completionColor = null;
    }
}

/**
 * RewardTrackPointIndicatorView — the little "N points" marker under the prize track, with a tick
 * or a cross depending on whether the player has reached it.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/quest/rewardtrack/view/prizes/RewardTrackPointIndicatorView.as
 *
 * These are pooled by `RewardTrackPrizeTrackView`: the constructor clones the template but takes no
 * data, `initialize()` binds it to a track and a threshold, and `clear()` releases it back to the
 * pool by hiding it rather than disposing it.
 */
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {RewardTrack} from '../../data/RewardTrack';

export class RewardTrackPointIndicatorView
{
    // AS3: RewardTrackPointIndicatorView.as::refreshAvailability()
    private static readonly AVAILABLE_ICON: string = 'reward_track_available_icon';

    // AS3: RewardTrackPointIndicatorView.as::refreshAvailability()
    private static readonly NOT_AVAILABLE_ICON: string = 'reward_track_not_available_icon';

    /** Derived name — `_SafeStr_4821`: the track this marker belongs to while in use. */
    // AS3: RewardTrackPointIndicatorView.as::_SafeStr_4821
    private _track: RewardTrack | null = null;

    /** Derived name — `_SafeStr_6611`: the point threshold this marker sits at. */
    // AS3: RewardTrackPointIndicatorView.as::_SafeStr_6611
    private _requiredPoints: number = 0;

    // AS3: RewardTrackPointIndicatorView.as::_window
    private _window: IWindowContainer | null;

    // AS3: RewardTrackPointIndicatorView.as::_disposed
    private _disposed: boolean = false;

    // AS3: RewardTrackPointIndicatorView.as::RewardTrackPointIndicatorView()
    constructor(template: IWindowContainer)
    {
        this._window = (template as unknown as IWindow).clone() as unknown as IWindowContainer;
    }

    // AS3: RewardTrackPointIndicatorView.as::initialize()
    public initialize(track: RewardTrack, requiredPoints: number): void
    {
        this._track = track;
        this._requiredPoints = requiredPoints;

        const text = this.pointsText;

        if(text !== null) text.text = String(requiredPoints);

        this.refreshAvailability();
    }

    // AS3: RewardTrackPointIndicatorView.as::refreshAvailability()
    public refreshAvailability(): void
    {
        if(this._track === null) return;

        const icon = this.availableIcon;

        if(icon === null) return;

        icon.assetUri = this._track.points >= this._requiredPoints
            ? RewardTrackPointIndicatorView.AVAILABLE_ICON
            : RewardTrackPointIndicatorView.NOT_AVAILABLE_ICON;
    }

    /** Returns the marker to the pool: unbound and hidden, but still alive. */
    // AS3: RewardTrackPointIndicatorView.as::clear()
    public clear(): void
    {
        this._track = null;
        this._requiredPoints = 0;

        const window = this._window as unknown as IWindow | null;

        if(window !== null) window.visible = false;
    }

    // AS3: RewardTrackPointIndicatorView.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: RewardTrackPointIndicatorView.as::get window()
    public get window(): IWindowContainer | null
    {
        return this._window;
    }

    // AS3: RewardTrackPointIndicatorView.as::get availableIcon()
    private get availableIcon(): IStaticBitmapWrapperWindow | null
    {
        return (this._window?.findChildByName('available_icon') ?? null) as IStaticBitmapWrapperWindow | null;
    }

    // AS3: RewardTrackPointIndicatorView.as::get pointsText()
    private get pointsText(): ITextWindow | null
    {
        return (this._window?.findChildByName('points_txt') ?? null) as ITextWindow | null;
    }

    // AS3: RewardTrackPointIndicatorView.as::dispose()
    public dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;

        const window = this._window as unknown as IWindow | null;

        if(window !== null)
        {
            if(window.parent !== null)
            {
                (window.parent as unknown as IWindowContainer).removeChild(window);
            }

            window.dispose();
        }

        this._window = null;
        this._track = null;
        this._requiredPoints = 0;
    }
}

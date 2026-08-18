/**
 * RewardTrackHeaderView — the strip above the prize track: the player's avatar, the track's
 * name/description/instructions, the point total and the "N of M rewards collected" line.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/quest/rewardtrack/view/header/RewardTrackHeaderView.as
 *
 * It owns no window — the track view hands it one out of `reward_track_main_xml` — so `dispose()`
 * unhooks and drops references rather than disposing anything.
 *
 * The title doubles as a staff-only "copy track id" button: the region is only wired, and only
 * shows an interactive cursor, when `canCopyDebugIds` is true.
 */
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IRegionWindow} from '@core/window/components/IRegionWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {IAvatarImageWidget} from '@habbo/window/widgets/IAvatarImageWidget';
import type {RewardTrack} from '../../data/RewardTrack';
import type {RewardTrackController} from '../../RewardTrackController';

export class RewardTrackHeaderView
{
    /** Derived name — `_SafeStr_4593`: the controller. */
    // AS3: RewardTrackHeaderView.as::_SafeStr_4593
    private _controller: RewardTrackController | null;

    // AS3: RewardTrackHeaderView.as::_window
    private _window: IWindowContainer | null;

    /** Derived name — `_SafeStr_4821`: the track being shown. */
    // AS3: RewardTrackHeaderView.as::_SafeStr_4821
    private _track: RewardTrack | null;

    // AS3: RewardTrackHeaderView.as::_disposed
    private _disposed: boolean = false;

    // AS3: RewardTrackHeaderView.as::RewardTrackHeaderView()
    constructor(controller: RewardTrackController, window: IWindowContainer, track: RewardTrack)
    {
        this._controller = controller;
        this._window = window;
        this._track = track;

        this.initialize();
    }

    // AS3: RewardTrackHeaderView.as::initialize()
    private initialize(): void
    {
        const id = this._track?.id ?? '';

        this.refreshOwnAvatar();

        this.setText(this.trackTitleText, this.localize(`reward_track.${id}.name`));
        this.setText(this.trackDescText, this.localize(`reward_track.${id}.desc`));
        this.setText(this.trackInstructionsText, this.localize(`reward_track.${id}.info`));

        this.initializeStaffActions();
        this.refresh();
    }

    // AS3: RewardTrackHeaderView.as::initializeStaffActions()
    private initializeStaffActions(): void
    {
        const region = this.trackTitleRegion;

        if(region === null) return;

        const canCopy = this._controller?.canCopyDebugIds ?? false;

        region.interactiveCursorDisabled = !canCopy;

        if(canCopy)
        {
            (region as unknown as IWindow).addEventListener('WME_CLICK', this.onTrackTitleClicked);
        }
    }

    // AS3: RewardTrackHeaderView.as::refresh()
    public refresh(): void
    {
        this.refreshPoints();
        this.refreshRewardsCollected();
    }

    // AS3: RewardTrackHeaderView.as::refreshOwnAvatar()
    public refreshOwnAvatar(): void
    {
        const avatar = this.ownAvatar;

        if(avatar != null)
        {
            avatar.figure = this._controller?.questEngine?.sessionDataManager?.figure ?? '';
        }
    }

    // AS3: RewardTrackHeaderView.as::refreshPoints()
    public refreshPoints(): void
    {
        this.setText(this.pointsTotalCollectedText, String(this._track?.points ?? 0));
    }

    // AS3: RewardTrackHeaderView.as::refreshRewardsCollected()
    public refreshRewardsCollected(): void
    {
        this.setText(this.rewardsCollectedText, this._controller?.localizationManager?.getLocalizationWithParams(
            'reward_track.profile.rewards_collected',
            '',
            'progress', String(this._track?.claimedPrizeCount ?? 0),
            'total', String(this._track?.totalPrizeCount ?? 0)
        ) ?? '');
    }

    // AS3: RewardTrackHeaderView.as::localize()
    private localize(key: string): string
    {
        return this._controller?.localizationManager?.getLocalizationWithParams(key, key) ?? key;
    }

    // TS-only: the null-guarded form of AS3's `someTextWindow.text = value`.
    private setText(target: ITextWindow | null, value: string): void
    {
        if(target !== null) target.text = value;
    }

    // AS3: RewardTrackHeaderView.as::onTrackTitleClicked()
    private onTrackTitleClicked = (): void =>
    {
        this._controller?.copyTrackId(this._track?.id ?? '');
    };

    // AS3: RewardTrackHeaderView.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: RewardTrackHeaderView.as::get ownAvatar()
    private get ownAvatar(): IAvatarImageWidget | null
    {
        return (this.ownAvatarWidget?.widget ?? null) as unknown as IAvatarImageWidget | null;
    }

    // AS3: RewardTrackHeaderView.as::get ownAvatarWidget()
    private get ownAvatarWidget(): IWidgetWindow | null
    {
        return (this._window?.findChildByName('own_avatar') ?? null) as unknown as IWidgetWindow | null;
    }

    // AS3: RewardTrackHeaderView.as::get trackTitleText()
    private get trackTitleText(): ITextWindow | null
    {
        return (this._window?.findChildByName('track_title_txt') ?? null) as ITextWindow | null;
    }

    // AS3: RewardTrackHeaderView.as::get trackTitleRegion()
    private get trackTitleRegion(): IRegionWindow | null
    {
        return (this._window?.findChildByName('track_title_region') ?? null) as unknown as IRegionWindow | null;
    }

    // AS3: RewardTrackHeaderView.as::get trackDescText()
    private get trackDescText(): ITextWindow | null
    {
        return (this._window?.findChildByName('track_desc_txt') ?? null) as ITextWindow | null;
    }

    // AS3: RewardTrackHeaderView.as::get trackInstructionsText()
    private get trackInstructionsText(): ITextWindow | null
    {
        return (this._window?.findChildByName('track_instructions_txt') ?? null) as ITextWindow | null;
    }

    // AS3: RewardTrackHeaderView.as::get pointsTotalCollectedText()
    private get pointsTotalCollectedText(): ITextWindow | null
    {
        return (this._window?.findChildByName('points_total_collected_txt') ?? null) as ITextWindow | null;
    }

    // AS3: RewardTrackHeaderView.as::get rewardsCollectedText()
    private get rewardsCollectedText(): ITextWindow | null
    {
        return (this._window?.findChildByName('rewards_collected_txt') ?? null) as ITextWindow | null;
    }

    // AS3: RewardTrackHeaderView.as::dispose()
    public dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;

        (this.trackTitleRegion as unknown as IWindow | null)?.removeEventListener('WME_CLICK', this.onTrackTitleClicked);

        this._controller = null;
        this._window = null;
        this._track = null;
    }
}

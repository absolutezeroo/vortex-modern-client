import {Component} from '@core/runtime/Component';
import {ComponentDependency} from '@core/runtime/ComponentDependency';
import type {IContext} from '@core/runtime/IContext';
import {copyBitmap} from '@habbo/notifications/utils/copyBitmap';
import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {ILinkEventTracker} from '@core/runtime/events/ILinkEventTracker';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';
import {Logger} from '@core/utils/Logger';

import type {IHabboCommunicationManager} from '@habbo/communication/IHabboCommunicationManager';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import {RewardTracksMessageEvent} from '@habbo/communication/messages/incoming/quest/RewardTracksMessageEvent';
import {
    RewardTrackClaimResultMessageEvent
} from '@habbo/communication/messages/incoming/quest/RewardTrackClaimResultMessageEvent';
import {
    RewardTrackProgressMessageEvent
} from '@habbo/communication/messages/incoming/quest/RewardTrackProgressMessageEvent';
import {
    RewardTrackPremiumPurchaseResultMessageEvent
} from '@habbo/communication/messages/incoming/quest/RewardTrackPremiumPurchaseResultMessageEvent';
import {
    ClaimRewardTrackPrizeMessageComposer
} from '@habbo/communication/messages/outgoing/quest/ClaimRewardTrackPrizeMessageComposer';
import {
    PurchaseRewardTrackPremiumMessageComposer
} from '@habbo/communication/messages/outgoing/quest/PurchaseRewardTrackPremiumMessageComposer';

import type {HabboQuestEngine} from '../HabboQuestEngine';
import {UnseenRewardTrackRewardsCountUpdateEvent} from '../events/UnseenRewardTrackRewardsCountUpdateEvent';
import {RewardTrack} from './data/RewardTrack';
import type {RewardTrackPrize} from './data/RewardTrackPrize';
import type {RewardTrackTask} from './data/RewardTrackTask';
import type {IRewardTrackController} from './IRewardTrackController';
import {RewardTrackView} from './view/RewardTrackView';
import {RewardTrackPremiumPurchaseConfirmationView} from './view/premium/RewardTrackPremiumPurchaseConfirmationView';

import {IID_HabboCommunicationManager} from '@iid/IIDHabboCommunicationManager';
import {IID_HabboWindowManager} from '@iid/IIDHabboWindowManager';
import {IID_HabboLocalizationManager} from '@iid/IIDHabboLocalizationManager';

const log = Logger.getLogger('habbo.quest.rewardtrack.RewardTrackController');

/**
 * The reward track — seasonal "battle pass" boards: tasks that pay points, points that unlock prizes
 * along a track, and an optional premium tier bought with credits and/or diamonds.
 *
 * **One window per track, cached by id and reused.** `openRewardTrack()` hands the previous window's
 * position to the next one, so switching between tracks does not make the board jump around the
 * desktop. The cache is thrown away wholesale when the server re-sends the track list.
 *
 * The toolbar's unclaimed badge is this class's other job: `broadcastClaimableRewardsCount()` counts
 * every claimable prize across every track and raises
 * `UnseenRewardTrackRewardsCountUpdateEvent`. Progress updates pass `false` so an unchanged count
 * raises nothing — that message arrives on every counted action.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/quest/rewardtrack/RewardTrackController.as
 */
export class RewardTrackController extends Component implements IRewardTrackController, ILinkEventTracker
{
    // AS3: RewardTrackController.as::DESKTOP_WINDOW_LAYER
    public static readonly DESKTOP_WINDOW_LAYER: number = 1;

    // AS3: RewardTrackController.as::FREE_CLAIM_NOTIFICATION_ICON
    private static readonly FREE_CLAIM_NOTIFICATION_ICON: string = 'reward_track_free_track';

    // AS3: RewardTrackController.as::PREMIUM_CLAIM_NOTIFICATION_ICON
    private static readonly PREMIUM_CLAIM_NOTIFICATION_ICON: string = 'reward_track_premium_track';

    // AS3: RewardTrackController.as::_questEngine
    private _questEngine: HabboQuestEngine;

    // AS3: RewardTrackController.as::_communicationManager
    private _communicationManager: IHabboCommunicationManager | null = null;

    // AS3: RewardTrackController.as::_localizationManager
    private _localizationManager: IHabboLocalizationManager | null = null;

    // AS3: RewardTrackController.as::_windowManager
    private _windowManager: IHabboWindowManager | null = null;

    /** Derived name — `_SafeStr_5633` (from `get tracks()`). */
    // AS3: RewardTrackController.as::_SafeStr_5633
    private _tracks: RewardTrack[] = [];

    /** Derived name — `_SafeStr_5978`: the per-track window cache, keyed by track id. */
    // AS3: RewardTrackController.as::_SafeStr_5978
    private _viewsByTrackId: Map<string, RewardTrackView> = new Map();

    /** Derived name — `_SafeStr_5578`: the track window most recently opened. */
    // AS3: RewardTrackController.as::_SafeStr_5578
    private _activeView: RewardTrackView | null = null;

    /** Derived name — `_SafeStr_5804`. */
    // AS3: RewardTrackController.as::_SafeStr_5804
    private _premiumConfirmation: RewardTrackPremiumPurchaseConfirmationView | null = null;

    // AS3: RewardTrackController.as::_messageEvents
    private _messageEvents: IMessageEvent[] = [];

    /** Derived name — `_SafeStr_9239`: the count last broadcast; `-1` means "never". */
    // AS3: RewardTrackController.as::_SafeStr_9239
    private _lastBroadcastCount: number = -1;

    // AS3: RewardTrackController.as::_disposed
    private _controllerDisposed: boolean = false;

    /**
     * AS3 subscribes its four events in the *constructor*, where `addMessageEvent()` short-circuits
     * on a still-null communication manager and the subscriptions are silently lost. They are built
     * in `initComponent()` here instead — the first point at which the manager exists — exactly as
     * `DailyTasksController` already does for the same reason. Same four events, same handlers.
     */
    // AS3: RewardTrackController.as::RewardTrackController()
    constructor(
        questEngine: HabboQuestEngine,
        context: IContext,
        flags: number = 0,
        assetLibrary: IAssetLibrary | null = null
    )
    {
        super(context, flags, assetLibrary);

        this._questEngine = questEngine;
    }

    // AS3: RewardTrackController.as::get dependencies()
    protected override get dependencies(): Array<ComponentDependency<any>>
    {
        return [
            new ComponentDependency(
                IID_HabboCommunicationManager,
                (manager: IHabboCommunicationManager | null) =>
                {
                    this._communicationManager = manager;
                },
                true
            ),
            new ComponentDependency(
                IID_HabboWindowManager,
                (manager: IHabboWindowManager | null) =>
                {
                    this._windowManager = manager;
                }
            ),
            new ComponentDependency(
                IID_HabboLocalizationManager,
                (manager: IHabboLocalizationManager | null) =>
                {
                    this._localizationManager = manager;
                }
            ),
        ];
    }

    // AS3: RewardTrackController.as::initComponent()
    protected override initComponent(): void
    {
        this.context?.addLinkEventTracker(this);

        this._messageEvents = [
            new RewardTracksMessageEvent(this.onRewardTracks),
            new RewardTrackClaimResultMessageEvent(this.onRewardTrackClaimResult),
            new RewardTrackProgressMessageEvent(this.onRewardTrackProgress),
            new RewardTrackPremiumPurchaseResultMessageEvent(this.onRewardTrackPremiumPurchaseResult),
        ];

        for(const event of this._messageEvents) this.addMessageEvent(event);
    }

    // AS3: RewardTrackController.as::get linkPattern()
    get linkPattern(): string
    {
        return 'reward_track/';
    }

    // AS3: RewardTrackController.as::linkReceived()
    linkReceived(link: string): void
    {
        const parts = link.split('/');

        if(parts.length >= 3 && parts[1] === 'open') this.openRewardTrack(parts[2]);
    }

    // AS3: RewardTrackController.as::openRewardTrack()
    openRewardTrack(trackId: string): void
    {
        const track = this.getTrackById(trackId);

        if(track === null) return;

        let location: {x: number; y: number} | null = null;

        if(this._activeView !== null && !this._activeView.disposed)
        {
            location = this._activeView.location;
            this._activeView.hide();
        }

        let view = this._viewsByTrackId.get(trackId) ?? null;

        if(view === null || view.disposed)
        {
            view = new RewardTrackView(this, track);

            this._viewsByTrackId.set(trackId, view);

            view.initialize();
            view.center();
        }

        if(location !== null) view.setLocation(location);

        view.show();
        view.activate();

        this._activeView = view;
    }

    // AS3: RewardTrackController.as::claimPrize()
    claimPrize(trackId: string, prizeId: string): void
    {
        this.send(new ClaimRewardTrackPrizeMessageComposer(trackId, prizeId));
    }

    // AS3: RewardTrackController.as::purchasePremium()
    purchasePremium(trackId: string): void
    {
        this.send(new PurchaseRewardTrackPremiumMessageComposer(trackId));
    }

    /** Staff only — security rank 4 (moderator) or 5 (admin). */
    // AS3: RewardTrackController.as::get canCopyDebugIds()
    get canCopyDebugIds(): boolean
    {
        const session = this._questEngine?.sessionDataManager ?? null;

        return (session?.hasSecurity(4) ?? false) || (session?.hasSecurity(5) ?? false);
    }

    // AS3: RewardTrackController.as::copyTrackId()
    copyTrackId(trackId: string): void
    {
        this.copyDebugId(trackId, '${reward_track.debug.copy_track_id.success}');
    }

    // AS3: RewardTrackController.as::copyTaskId()
    copyTaskId(taskId: string): void
    {
        this.copyDebugId(taskId, '${reward_track.debug.copy_task_id.success}');
    }

    // AS3: RewardTrackController.as::openPremiumPurchaseConfirmation()
    openPremiumPurchaseConfirmation(track: RewardTrack): void
    {
        this.closePremiumPurchaseConfirmation();

        this._premiumConfirmation = new RewardTrackPremiumPurchaseConfirmationView(this, track);
        this._premiumConfirmation.show();
    }

    // AS3: RewardTrackController.as::closePremiumPurchaseConfirmation()
    closePremiumPurchaseConfirmation(): void
    {
        if(this._premiumConfirmation === null) return;

        this._premiumConfirmation.dispose();
        this._premiumConfirmation = null;
    }

    // AS3: RewardTrackController.as::onRewardTracks()
    private onRewardTracks = (event: IMessageEvent): void =>
    {
        const parser = (event as RewardTracksMessageEvent).rewardTrackParser;
        const wasShowing = this._activeView !== null && !this._activeView.disposed && this._activeView.isShowing();
        const hadTracks = this._tracks.length > 0;

        if(parser.reload || parser.disabled || hadTracks)
        {
            this.disposeCachedViews();
            this.closePremiumPurchaseConfirmation();
        }

        this._tracks = [];

        if(!parser.disabled)
        {
            for(const data of parser.tracks ?? [])
            {
                this._tracks.push(new RewardTrack(data));
            }
        }

        if(parser.reload && wasShowing)
        {
            this._windowManager?.alert(
                this._localizationManager?.getLocalization(
                    'reward_track.reload.title', 'reward_track.reload.title'
                ) ?? 'reward_track.reload.title',
                this._localizationManager?.getLocalization(
                    'reward_track.reload.desc', 'reward_track.reload.desc'
                ) ?? 'reward_track.reload.desc',
                0,
                null
            );
        }

        this.broadcastClaimableRewardsCount();
    };

    // AS3: RewardTrackController.as::onRewardTrackProgress()
    private onRewardTrackProgress = (event: IMessageEvent): void =>
    {
        const parser = (event as RewardTrackProgressMessageEvent).rewardTrackParser;
        const track = this.getTrackById(parser.trackId);

        if(track === null) return;

        let task = track.getTaskById(parser.taskId);

        const hadProgress = task !== null && task.hasProgress;
        const wasComplete = task !== null && task.isComplete;

        task = track.updateProgress(parser.taskId, parser.progressCount, parser.points);

        this.updateProgressViews(track, task, hadProgress, wasComplete);
        this.broadcastClaimableRewardsCount(false);
    };

    // AS3: RewardTrackController.as::onRewardTrackClaimResult()
    private onRewardTrackClaimResult = (event: IMessageEvent): void =>
    {
        const parser = (event as RewardTrackClaimResultMessageEvent).rewardTrackParser;

        if(parser.resultCode !== 0)
        {
            this.showNotification(this.localizeResult('reward_track.claim.notification.fail.', parser.resultCode));

            return;
        }

        const track = this.getTrackById(parser.trackId);

        if(track === null) return;

        const prize = track.markPrizeClaimed(parser.rewardId);

        this.updatePrizeClaimViews(track, prize);
        this.broadcastClaimableRewardsCount();
        this.showClaimSuccessNotification(prize);
    };

    // AS3: RewardTrackController.as::onRewardTrackPremiumPurchaseResult()
    private onRewardTrackPremiumPurchaseResult = (event: IMessageEvent): void =>
    {
        const parser = (event as RewardTrackPremiumPurchaseResultMessageEvent).rewardTrackParser;

        if(parser.resultCode !== 0)
        {
            this.showNotification(this.localizeResult('reward_track.premium.notification.fail.', parser.resultCode));

            if(this._premiumConfirmation !== null && !this._premiumConfirmation.disposed)
            {
                this._premiumConfirmation.purchaseFailed();
            }

            return;
        }

        const track = this.getTrackById(parser.trackId);

        if(track === null)
        {
            this.closePremiumPurchaseConfirmation();

            return;
        }

        track.markPremiumPurchased(parser.points);

        this.updatePremiumPurchaseViews(track);
        this.broadcastClaimableRewardsCount();
        this.closePremiumPurchaseConfirmation();
        this.showNotification('${reward_track.premium.notification.success}');
    };

    // AS3: RewardTrackController.as::broadcastClaimableRewardsCount()
    private broadcastClaimableRewardsCount(force: boolean = true): void
    {
        let count = 0;

        for(const track of this._tracks)
        {
            for(const prize of track.prizes)
            {
                if(prize.isClaimable(track)) count += 1;
            }
        }

        if(!force && count === this._lastBroadcastCount) return;

        this._lastBroadcastCount = count;

        this._questEngine?.events?.emit(
            UnseenRewardTrackRewardsCountUpdateEvent.TYPE, new UnseenRewardTrackRewardsCountUpdateEvent(count)
        );
    }

    /** The result code is the key's last segment; an unknown code falls back to the key itself. */
    // AS3: RewardTrackController.as::localizeResult()
    private localizeResult(prefix: string, resultCode: number): string
    {
        const key = prefix + resultCode;

        return this._localizationManager?.getLocalization(key, key) ?? key;
    }

    // AS3: RewardTrackController.as::showClaimSuccessNotification()
    private showClaimSuccessNotification(prize: RewardTrackPrize | null): void
    {
        this.showNotification(
            '${reward_track.claim.notification.success}',
            prize !== null && prize.premium
                ? RewardTrackController.PREMIUM_CLAIM_NOTIFICATION_ICON
                : RewardTrackController.FREE_CLAIM_NOTIFICATION_ICON
        );
    }

    // AS3: RewardTrackController.as::showNotification()
    private showNotification(content: string, iconAssetName: string | null = null): void
    {
        const notifications = this._questEngine?.notifications ?? null;

        if(notifications === null) return;

        if(iconAssetName === null)
        {
            notifications.addItem(content, 'info');

            return;
        }

        // A COPY, because `HabboNotificationItemStyle` is built with `ownsIcon` true and closes the
        // bitmap when the bubble expires. Handing it `getAsset()` directly destroys the shared
        // library asset for the rest of the session: the `ImageBitmap` detaches, and every later
        // `drawImage` of it throws `InvalidStateError: The image source is detached` from inside a
        // paint — which aborts the frame, so what the user sees is not a missing icon but a window
        // stuck half-drawn. Observed with the fishing catch bubble, which took the Fish-O-Pedia and
        // the tooltips down with it.
        notifications.addItemWithBitmap(content, 'info', copyBitmap(this._windowManager?.getAsset(iconAssetName) ?? null));
    }

    // AS3: RewardTrackController.as::copyDebugId()
    private copyDebugId(id: string, successMessage: string): void
    {
        if(!this.canCopyDebugIds) return;

        void navigator.clipboard?.writeText(id).catch(() =>
        {
            log.warn(`Clipboard write refused — "${id}" was not copied`);
        });

        this.showNotification(successMessage);
    }

    // AS3: RewardTrackController.as::updateProgressViews()
    private updateProgressViews(
        track: RewardTrack, task: RewardTrackTask | null, hadProgress: boolean, wasComplete: boolean
    ): void
    {
        this.getTrackView(track)?.taskProgressUpdated(task, hadProgress, wasComplete);
    }

    // AS3: RewardTrackController.as::updatePrizeClaimViews()
    private updatePrizeClaimViews(track: RewardTrack, prize: RewardTrackPrize | null): void
    {
        if(prize === null) return;

        this.getTrackView(track)?.prizeClaimed(prize);
    }

    // AS3: RewardTrackController.as::updatePremiumPurchaseViews()
    private updatePremiumPurchaseViews(track: RewardTrack): void
    {
        this.getTrackView(track)?.premiumPurchased();
    }

    // AS3: RewardTrackController.as::getTrackView()
    private getTrackView(track: RewardTrack): RewardTrackView | null
    {
        const view = this._viewsByTrackId.get(track.id) ?? null;

        if(view !== null && !view.disposed && view.track === track) return view;

        return null;
    }

    // AS3: RewardTrackController.as::disposeCachedViews()
    private disposeCachedViews(): void
    {
        for(const view of this._viewsByTrackId.values())
        {
            if(!view.disposed) view.dispose();
        }

        this._viewsByTrackId = new Map();
        this._activeView = null;
    }

    // AS3: RewardTrackController.as::update()
    update(deltaTime: number): void
    {
        for(const view of this._viewsByTrackId.values())
        {
            if(!view.disposed) view.update(deltaTime);
        }
    }

    // AS3: RewardTrackController.as::getTrackById()
    getTrackById(trackId: string): RewardTrack | null
    {
        for(const track of this._tracks)
        {
            if(track.id === trackId) return track;
        }

        return null;
    }

    // AS3: RewardTrackController.as::isRewardTrackComplete()
    isRewardTrackComplete(trackId: string): boolean
    {
        const track = this.getTrackById(trackId);

        return track !== null && track.complete;
    }

    // AS3: RewardTrackController.as::hasRewardTrack()
    hasRewardTrack(trackId: string): boolean
    {
        return this.getTrackById(trackId) !== null;
    }

    // AS3: RewardTrackController.as::send()
    send(composer: IMessageComposer<unknown[]>): void
    {
        this._communicationManager?.connection?.send(composer);
    }

    // AS3: RewardTrackController.as::addMessageEvent()
    addMessageEvent(event: IMessageEvent): void
    {
        if(this._communicationManager === null) return;

        this._communicationManager.addMessageEvent(event);
    }

    // AS3: RewardTrackController.as::removeMessageEvent()
    removeMessageEvent(event: IMessageEvent): void
    {
        if(this._communicationManager === null) return;

        this._communicationManager.removeMessageEvent(event);
    }

    // AS3: RewardTrackController.as::get disposed()
    override get disposed(): boolean
    {
        return this._controllerDisposed;
    }

    // AS3: RewardTrackController.as::get tracks()
    get tracks(): RewardTrack[]
    {
        return this._tracks;
    }

    // AS3: RewardTrackController.as::get localizationManager()
    get localizationManager(): IHabboLocalizationManager | null
    {
        return this._localizationManager;
    }

    // AS3: RewardTrackController.as::get windowManager()
    get windowManager(): IHabboWindowManager | null
    {
        return this._windowManager;
    }

    // AS3: RewardTrackController.as::get questEngine()
    get questEngine(): HabboQuestEngine
    {
        return this._questEngine;
    }

    // AS3: RewardTrackController.as::dispose()
    override dispose(): void
    {
        if(this._controllerDisposed) return;

        this._controllerDisposed = true;

        this.context?.removeLinkEventTracker(this);

        this.closePremiumPurchaseConfirmation();
        this.disposeCachedViews();

        for(const event of this._messageEvents) this.removeMessageEvent(event);

        this._messageEvents = [];
        this._tracks = [];
        this._communicationManager = null;
        this._windowManager = null;
        this._localizationManager = null;

        super.dispose();
    }
}

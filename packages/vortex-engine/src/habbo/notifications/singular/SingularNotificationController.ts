import type {IUpdateReceiver} from '@core/runtime/IContext';
import type {HabboNotifications} from '../HabboNotifications';
import {HabboNotificationItem} from './HabboNotificationItem';
import {HabboNotificationItemStyle} from './HabboNotificationItemStyle';
import {HabboAlertDialogManager} from './HabboAlertDialogManager';
import {RoomEnterEffect} from '@room/utils/RoomEnterEffect';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('SingularNotificationController');

/**
 * Manages the notification item queue and display.
 * Implements IUpdateReceiver to process the queue each frame.
 *
 * In AS3, this also manages the HabboNotificationViewManager for rendering
 * notification bubbles. In our implementation, the view is handled by SolidJS,
 * so this class focuses on queue management and emitting events. AS3's own
 * per-type icon/style config (parsed from the "habbo_notifications_config_xml"
 * asset into a styles map) is not ported either - addItem() below documents
 * exactly where that would plug in.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/notifications/singular/SingularNotificationController.as
 */
export class SingularNotificationController implements IUpdateReceiver
{
    private static readonly MODERATION_DISCLAIMER_DELAY_MS: number = 5000;

    private _notifications: HabboNotifications | null;
    private _queue: HabboNotificationItem[] = [];
    private _moderationDisclaimerShown: boolean = false;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/notifications/singular/SingularNotificationController.as::_SafeStr_5464
    private _moderationDisclaimerTimer: ReturnType<typeof setTimeout> | null = null;

    constructor(notifications: HabboNotifications)
    {
        this._notifications = notifications;
        this._alertDialogManager = new HabboAlertDialogManager();

        // Register for frame updates
        this._notifications.registerUpdateReceiver(this, 2);
    }

    private _alertDialogManager: HabboAlertDialogManager;

    get alertDialogManager(): HabboAlertDialogManager
    {
        return this._alertDialogManager;
    }

    private _disposed: boolean = false;

    get disposed(): boolean
    {
        return this._disposed;
    }

    /**
	 * Frame update callback. Processes the notification queue.
	 *
	 * TODO(AS3): AS3 also guards this on
	 * `HabboNotificationViewManager.isSpaceAvailable()` - that view manager isn't
	 * ported (SolidJS owns rendering here), so there is nothing to gate on yet.
	 *
	 * @param _deltaTime Time since last frame in ms
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/notifications/singular/SingularNotificationController.as::update()
    update(_deltaTime: number): void
    {
        if(this._queue.length > 0)
        {
            const item = this.getNextItemFromQueue();

            if(item)
            {
                // Emit the item for the UI layer to display
                this._notifications?.notificationEvents.emit('showItem', item);
            }
        }
    }

    /**
	 * Add a notification item to the queue.
	 *
	 * TODO(AS3): AS3 resolves `type` against a styles map parsed from the
	 * "habbo_notifications_config_xml" asset and REJECTS the item (returns 0)
	 * if the type is unknown - that config system isn't ported (no styles map
	 * exists anywhere in this port), so `styleMap` is always null here and no
	 * type is ever rejected. The dedup-by-id check below is fully faithful.
	 *
	 * @param content The notification text
	 * @param type The notification style type key
	 * @param iconBitmap Optional explicit icon bitmap (overrides any icon a
	 * styles map would have resolved, had one existed)
	 * @param iconAssetUri Optional icon asset URI
	 * @param iconSrc Optional icon source
	 * @param internalLink Optional internal link to execute on click
	 * @param extraData Optional per-notification data (e.g. "id" for dedup)
	 * @returns The current queue length, or 0 if rejected/disabled
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/notifications/singular/SingularNotificationController.as::addItem()
    addItem(
        content: string,
        type: string,
        // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/notifications/singular/SingularNotificationController.as::addItem() param3
        iconBitmap: ImageBitmap | null = null,
        iconAssetUri: string | null = null,
        // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/notifications/singular/SingularNotificationController.as::addItem() param5
        iconSrc: string | null = null,
        // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/notifications/singular/SingularNotificationController.as::addItem() param6
        internalLink: string | null = null,
        // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/notifications/singular/SingularNotificationController.as::addItem() param7
        extraData: Record<string, unknown> | null = null
    ): number
    {
        if(this._notifications?.disabled)
        {
            return 0;
        }

        const notificationId = (extraData?.['id'] as string | null) ?? null;

        if(notificationId != null && this.hasNotificationById(notificationId))
        {
            return this._queue.length;
        }

        const style = new HabboNotificationItemStyle(null, iconBitmap, iconAssetUri, true, iconSrc, extraData ?? {}, type);

        if(internalLink)
        {
            style.internalLink = internalLink;
        }

        const item = new HabboNotificationItem(content, style, this);
        this._queue.push(item);

        log.debug(`Notification queued: "${content}" [${type}]`);

        return this._queue.length;
    }

    /**
	 * Remove all queued notifications matching the given id.
	 *
	 * TODO(AS3): AS3 also calls HabboNotificationViewManager.removeNotificationById()
	 * to remove an already-displayed bubble - not ported (see class doc).
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/notifications/singular/SingularNotificationController.as::removeNotificationById()
    removeNotificationById(notificationId: string | null): void
    {
        if(notificationId == null) return;

        for(let i = 0; i < this._queue.length; i++)
        {
            const item = this._queue[i];

            if(item != null && item.notificationId === notificationId)
            {
                item.dispose();
                this._queue.splice(i, 1);
                i--;
            }
        }
    }

    /**
	 * Whether a notification with the given id is currently queued.
	 *
	 * TODO(AS3): AS3 also checks HabboNotificationViewManager.hasNotificationId()
	 * for an already-displayed bubble - not ported (see class doc).
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/notifications/singular/SingularNotificationController.as::hasNotificationById()
    hasNotificationById(notificationId: string | null): boolean
    {
        if(notificationId == null) return false;

        for(const item of this._queue)
        {
            if(item.notificationId === notificationId)
            {
                return true;
            }
        }

        return false;
    }

    /**
	 * Add a song playing notification
	 *
	 * @param songName The name of the song
	 * @param songAuthor The author of the song
	 */
    addSongPlayingNotification(songName: string, songAuthor: string): void
    {
        // TODO: Requires localization manager integration for parameter substitution
        const content = `Now playing: ${songName} by ${songAuthor}`;
        this.addItem(content, 'soundmachine');
    }

    /**
	 * Handle an internal link click from a notification
	 *
	 * @param link The internal link string
	 */
    onInternalLink(link: string): void
    {
        this._notifications?.createLinkEvent(link);
    }

    /**
	 * Show the moderation disclaimer notification. Deferred (via a delayed timer)
	 * while the new-user room-enter effect is running, so it doesn't overlap it;
	 * only shown once per session.
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/notifications/singular/SingularNotificationController.as::showModerationDisclaimer()
    showModerationDisclaimer(): void
    {
        if(RoomEnterEffect.isRunning())
        {
            if(this._moderationDisclaimerTimer == null)
            {
                this._moderationDisclaimerTimer = setTimeout(
                    () =>
                    {
                        this._moderationDisclaimerTimer = null;
                        this.showModerationDisclaimer();
                    },
                    RoomEnterEffect.totalRunningTime + SingularNotificationController.MODERATION_DISCLAIMER_DELAY_MS
                );
            }
        }
        else if(!this._moderationDisclaimerShown)
        {
            // TODO: Requires localization for "mod.chatdisclaimer"
            this.addItem('Moderation disclaimer', 'info');
            this._moderationDisclaimerShown = true;
            log.debug('Moderation disclaimer shown');
        }
    }

    /**
	 * Show club gift notification
	 *
	 * @param numGifts Number of available club gifts
	 */
    showClubGiftNotification(numGifts: number): void
    {
        // TODO: Requires ClubGiftNotification view implementation
        log.debug(`Club gift notification: ${numGifts} gifts available`);
        this._notifications?.notificationEvents.emit('clubGiftNotification', numGifts);
    }

    /**
	 * Show safety locked notification
	 *
	 * @param userId The user ID
	 */
    showSafetyLockedNotification(userId: number): void
    {
        // TODO: Requires SafetyLockedNotification view implementation
        log.debug(`Safety locked notification for user: ${userId}`);
        this._notifications?.notificationEvents.emit('safetyLockedNotification', userId);
    }

    /**
	 * Hide the safety locked notification
	 */
    hideSafetyLockedNotification(): void
    {
        this._notifications?.notificationEvents.emit('hideSafetyLockedNotification');
    }

    /**
	 * Shows new-feature notifications whose config-driven conditions are currently met.
	 *
	 * TODO(AS3): AS3 (SingularNotificationController.as:294-354) reads the
	 * "notifications.new_feature.active" property (a comma-separated list of keys),
	 * retries each key up to 3 times (2s apart) while its condition is
	 * "reward_track_incomplete" and no reward track data has arrived yet, and
	 * constructs a NewFeatureNotification per key whose condition resolves visible.
	 * NewFeatureNotification (a window/view class) is not ported, so this is a stub.
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/notifications/singular/SingularNotificationController.as::maybeShowNewFeatureNotification()
    maybeShowNewFeatureNotification(_retryCount: number = 0): void
    {
    }

    /**
	 * Replaces a queued/displayed notification's icon once a requested badge image
	 * arrives from the server.
	 *
	 * TODO(AS3): AS3 listens for sessionDataManager's BIRE_BADGE_IMAGE_READY and
	 * forwards to HabboNotificationViewManager.replaceIcon() (not ported, see class
	 * doc) - neither the listener registration nor the view-manager call exist here.
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/notifications/singular/SingularNotificationController.as::onBadgeImage()
    private onBadgeImage(_event: unknown): void
    {
    }

    dispose(): void
    {
        if(this._disposed) return;

        if(this._moderationDisclaimerTimer != null)
        {
            clearTimeout(this._moderationDisclaimerTimer);
            this._moderationDisclaimerTimer = null;
        }

        if(this._alertDialogManager != null)
        {
            this._alertDialogManager.dispose();
        }

        // Dispose all queued items
        for(const item of this._queue)
        {
            item.dispose();
        }
        this._queue = [];

        if(this._notifications != null)
        {
            this._notifications.removeUpdateReceiver(this);
            this._notifications = null;
        }

        this._disposed = true;
    }

    /**
	 * Get the next item from the front of the queue
	 */
    private getNextItemFromQueue(): HabboNotificationItem | null
    {
        const items = this._queue.splice(0, 1);
        return items[0] ?? null;
    }
}

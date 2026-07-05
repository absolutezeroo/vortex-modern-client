import type {IUpdateReceiver} from '@core/runtime/IContext';
import type {HabboNotifications} from '../HabboNotifications';
import {HabboNotificationItem} from './HabboNotificationItem';
import {HabboNotificationItemStyle} from './HabboNotificationItemStyle';
import {HabboAlertDialogManager} from './HabboAlertDialogManager';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('SingularNotificationController');

/**
 * Manages the notification item queue and display.
 * Implements IUpdateReceiver to process the queue each frame.
 *
 * In AS3, this also manages the HabboNotificationViewManager for rendering
 * notification bubbles. In our implementation, the view is handled by SolidJS,
 * so this class focuses on queue management and emitting events.
 *
 * @see source_as_win63/habbo/notifications/singular/SingularNotificationController.as
 */
export class SingularNotificationController implements IUpdateReceiver
{
    private static readonly MODERATION_DISCLAIMER_DELAY_MS: number = 5000;

    private _notifications: HabboNotifications | null;
    private _queue: HabboNotificationItem[] = [];
    private _moderationDisclaimerShown: boolean = false;

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
	 * @param _deltaTime Time since last frame in ms
	 */
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
	 * @param content The notification text
	 * @param type The notification style type key
	 * @param iconAssetUri Optional icon asset URI
	 * @param iconSrc Optional icon source
	 * @param internalLink Optional internal link to execute on click
	 * @returns The current queue length
	 */
    addItem(
        content: string,
        type: string,
        iconAssetUri: string | null = null,
        iconSrc: string | null = null,
        internalLink: string | null = null
    ): number
    {
        if(this._notifications?.disabled)
        {
            return 0;
        }

        const style = new HabboNotificationItemStyle(null, iconAssetUri, true, iconSrc);

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
	 * Show the moderation disclaimer notification.
	 * Only shown once per session.
	 */
    showModerationDisclaimer(): void
    {
        if(!this._moderationDisclaimerShown)
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

    dispose(): void
    {
        if(this._disposed) return;

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

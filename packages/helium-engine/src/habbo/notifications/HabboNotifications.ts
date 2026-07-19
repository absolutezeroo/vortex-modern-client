import {EventEmitter} from 'eventemitter3';
import {Component, ComponentDependency, type IContext,} from '@core/runtime';
import {IID_SessionDataManager} from '@iid/IIDSessionDataManager';
import {IID_RoomSessionManager} from '@iid/IIDRoomSessionManager';
import {IID_HabboInventory} from '@iid/IIDHabboInventory';
import {IID_HabboFriendList} from '@iid/IIDHabboFriendList';
import {IID_RoomEngine} from '@iid/IIDRoomEngine';
import {IID_HabboCatalog} from '@iid/IIDHabboCatalog';
import {IID_HabboToolbar} from '@iid/IIDHabboToolbar';
import {IID_HabboWindowManager} from '@iid/IIDHabboWindowManager';
import {IID_HabboHelp} from '@iid/IIDHabboHelp';
import type {IHabboCommunicationManager} from '@habbo/communication/IHabboCommunicationManager';
import type {ISessionDataManager} from '@habbo/session/ISessionDataManager';
import type {IRoomSessionManager} from '@habbo/session/IRoomSessionManager';
import type {IHabboInventory} from '@habbo/inventory/IHabboInventory';
import type {IHabboFriendList} from '@habbo/friendlist/IHabboFriendList';
import type {IRoomEngine} from '@habbo/room';
import type {IHabboToolbar} from '@habbo/toolbar/IHabboToolbar';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IHabboHelp} from '@habbo/help/IHabboHelp';
import type {IHabboNotifications} from './IHabboNotifications';
import {SingularNotificationController} from './singular/SingularNotificationController';
import {NotificationMessageHandler} from './NotificationMessageHandler';
import {Logger} from '@core/utils/Logger';
import {IID_HabboCommunicationManager} from "@iid/IIDHabboCommunicationManager";
import {GetMOTDMessageComposer} from "@habbo/communication";
import type {IHabboLocalizationManager} from "@habbo/localization";
import {IID_HabboLocalizationManager} from "@iid";

const log = Logger.getLogger('HabboNotifications');

/**
 * Events emitted by the notifications component.
 * Used by the UI layer to react to notification state changes.
 * NOTE: This uses a separate EventEmitter (_notificationEvents) to avoid
 * overriding the Component.events getter (see MEMORY.md critical rule).
 */
export interface IHabboNotificationEvents
{
    'showItem': (item: unknown) => void;
    'clubGiftNotification': (numGifts: number) => void;
    'safetyLockedNotification': (userId: number) => void;
    'hideSafetyLockedNotification': () => void;
    'showNotification': (type: string, parameters: Map<string, string> | null) => void;
    'disabled': (disabled: boolean) => void;
}

/**
 * Main Habbo notifications component.
 * Extends Component for dependency injection lifecycle.
 * Manages notification bubbles, feed items, and alert dialogs.
 *
 * Dependencies:
 * - IHabboCommunicationManager (required) - for message events
 * - ISessionDataManager (optional) - for user data
 * - IRoomSessionManager (optional) - for room session state
 *
 * @see source_as_win63/habbo/notifications/HabboNotifications.as
 */
export class HabboNotifications extends Component implements IHabboNotifications
{
    private _messageHandler: NotificationMessageHandler | null = null;
    private _inventory: IHabboInventory | null = null;
    private _friendList: IHabboFriendList | null = null;
    private _roomEngine: IRoomEngine | null = null;
    private _catalog: unknown | null = null;
    private _toolbar: IHabboToolbar | null = null;
    private _windowManager: IHabboWindowManager | null = null;
    private _habboHelp: IHabboHelp | null = null;

    constructor(context: IContext)
    {
        super(context);

        this._disabled = false;
    }

    /**
	 * Separate notification EventEmitter.
	 * CRITICAL: Do NOT override the `events` getter from Component.
	 * @see MEMORY.md - Component EventEmitter Override Bug
	 */
    private _notificationEvents: EventEmitter<IHabboNotificationEvents> = new EventEmitter();

    /**
	 * Get the notification-specific event emitter.
	 * Use this (NOT `events`) for notification events.
	 */
    get notificationEvents(): EventEmitter<IHabboNotificationEvents>
    {
        return this._notificationEvents;
    }

    private _communication: IHabboCommunicationManager | null = null;

    get communication(): IHabboCommunicationManager | null
    {
        return this._communication;
    }

    private _sessionDataManager: ISessionDataManager | null = null;

    get sessionDataManager(): ISessionDataManager | null
    {
        return this._sessionDataManager;
    }

    private _roomSessionManager: IRoomSessionManager | null = null;

    get roomSessionManager(): IRoomSessionManager | null
    {
        return this._roomSessionManager;
    }

    private _localizationManager: IHabboLocalizationManager | null = null;

    get localizationManager(): IHabboLocalizationManager | null
    {
        return this._localizationManager;
    }

    private _singularController: SingularNotificationController | null = null;

    get singularController(): SingularNotificationController | null
    {
        return this._singularController;
    }

    private _disabled: boolean = false;

    get disabled(): boolean
    {
        return this._disabled;
    }

    set disabled(value: boolean)
    {
        this._disabled = value;
        this._notificationEvents.emit('disabled', value);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    protected override get dependencies(): Array<ComponentDependency<any>>
    {
        return [
            new ComponentDependency(
                IID_HabboCommunicationManager,
                (manager: IHabboCommunicationManager | null) =>
                {
                    this._communication = manager;
                },
                true
            ),
            new ComponentDependency(
                IID_SessionDataManager,
                (manager: ISessionDataManager | null) =>
                {
                    this._sessionDataManager = manager;
                },
                false
            ),
            new ComponentDependency(
                IID_HabboLocalizationManager,
                (manager: IHabboLocalizationManager | null) =>
                {
                    this._localizationManager = manager;
                },
                false
            ),
            new ComponentDependency(
                IID_RoomSessionManager,
                (manager: IRoomSessionManager | null) =>
                {
                    this._roomSessionManager = manager;
                },
                false
            ),
            new ComponentDependency(
                IID_HabboInventory,
                (inventory: IHabboInventory | null) =>
                {
                    this._inventory = inventory;
                },
                false
            ),
            new ComponentDependency(
                IID_HabboFriendList,
                (friendList: IHabboFriendList | null) =>
                {
                    this._friendList = friendList;
                },
                false
            ),
            new ComponentDependency(
                IID_RoomEngine,
                (engine: IRoomEngine | null) =>
                {
                    this._roomEngine = engine;
                },
                false
            ),
            new ComponentDependency(
                IID_HabboCatalog,
                (catalog: unknown | null) =>
                {
                    this._catalog = catalog;
                },
                false
            ),
            new ComponentDependency(
                IID_HabboToolbar,
                (toolbar: IHabboToolbar | null) =>
                {
                    this._toolbar = toolbar;
                },
                false
            ),
            new ComponentDependency(
                IID_HabboWindowManager,
                (manager: IHabboWindowManager | null) =>
                {
                    this._windowManager = manager;
                },
                false
            ),
            new ComponentDependency(
                IID_HabboHelp,
                (help: IHabboHelp | null) =>
                {
                    this._habboHelp = help;
                },
                false
            ),
        ];
    }

    /**
	 * Activate the notifications system.
	 * Called by the NotificationMessageHandler after message events are registered.
	 *
	 * @see source_as_win63/habbo/notifications/HabboNotifications.as activate()
	 */
    activate(): void
    {
        if(this._communication?.connection)
        {
            this._communication.connection.send(new GetMOTDMessageComposer());
        }
    }

    /**
	 * Add a notification item with content, type, and optional icon asset name
	 *
	 * @param content The notification message text
	 * @param type The notification type string
	 * @param iconAssetName Optional asset name for the icon
	 *
	 * @see source_as_win63/habbo/notifications/HabboNotifications.as addItem()
	 */
    addItem(content: string, type: string, iconAssetName?: string | null): void
    {
        this._singularController?.addItem(content, type, null, iconAssetName ?? null);
    }

    /**
	 * Show a notification popup with the given type and parameters
	 *
	 * @param type The notification type key
	 * @param parameters Optional parameters map
	 *
	 * @see source_as_win63/habbo/notifications/HabboNotifications.as showNotification()
	 */
    showNotification(type: string, parameters?: Map<string, string> | null): void
    {
        const params = parameters ?? new Map<string, string>();

        // Check for configuration-defined notification properties
        const configKey = 'notification.' + type;

        if(this.propertyExists(configKey))
        {
            try
            {
                const configJson = this.getProperty(configKey);
                const configObj = JSON.parse(configJson) as Record<string, string>;

                for(const [key, value] of Object.entries(configObj))
                {
                    params.set(key, value);
                }
            }
            catch (e)
            {
                log.error(`Failed to parse notification config for "${configKey}":`, e);
            }
        }

        // Check if this should be displayed as a bubble
        if(params.get('display') === 'BUBBLE')
        {
            const message = this.getNotificationPart(params, type, 'message', true);
            const linkUrl = this.getNotificationPart(params, type, 'linkUrl', false);
            const imageUrl = this.getNotificationImageUrl(params, type);

            let internalLink: string | null = null;

            if(linkUrl != null && linkUrl.substring(0, 6) === 'event:')
            {
                internalLink = linkUrl.substring(6);
            }

            this._singularController?.addItem(
                message ?? '',
                'info',
                null,
                imageUrl,
                null,
                internalLink ?? linkUrl
            );
        }
        else
        {
            // Emit event for UI layer to show notification popup
            this._notificationEvents.emit('showNotification', type, params);
        }
    }

    /**
	 * Add a song playing notification
	 *
	 * @param songName The name of the song
	 * @param songAuthor The author of the song
	 *
	 * @see source_as_win63/habbo/notifications/HabboNotifications.as addSongPlayingNotification()
	 */
    addSongPlayingNotification(songName: string, songAuthor: string): void
    {
        this._singularController?.addSongPlayingNotification(songName, songAuthor);
    }

    /**
	 * Get a part of a notification (message, linkUrl, etc.)
	 * Resolves from parameters map or localization.
	 *
	 * @param params The notification parameters
	 * @param type The notification type
	 * @param part The part key to resolve
	 * @param required Whether the part is required
	 * @returns The resolved string or null
	 *
	 * @see source_as_win63/habbo/notifications/HabboNotifications.as getNotificationPart()
	 */
    getNotificationPart(
        params: Map<string, string>,
        type: string,
        part: string,
        required: boolean
    ): string | null
    {
        if(params.has(part))
        {
            return params.get(part) ?? null;
        }

        const locKey = ['notification', type, part].join('.');

        if(this._localizationManager)
        {
            if(this._localizationManager?.hasLocalization(locKey) || required)
            {
                return this._localizationManager.getLocalizationWithParamMap(locKey, locKey, params);
            }
        }

        if(required)
        {
            return locKey;
        }

        return null;
    }

    /**
	 * Get the notification image URL
	 *
	 * @param params The notification parameters
	 * @param type The notification type
	 * @returns The image URL
	 *
	 * @see source_as_win63/habbo/notifications/HabboNotifications.as getNotificationImageUrl()
	 */
    getNotificationImageUrl(params: Map<string, string>, type: string): string | null
    {
        const image = params.get('image');

        if(image != null)
        {
            return image;
        }

        return '${image.library.url}notifications/' + type.replace(/\./g, '_') + '.png';
    }

    /**
	 * Create a link event (dispatches through the context)
	 *
	 * @param link The link event string
	 *
	 * @see source_as_win63/habbo/notifications/HabboNotifications.as createLinkEvent()
	 */
    createLinkEvent(link: string): void
    {
        this.context.createLinkEvent(link);
    }

    override dispose(): void
    {
        if(this.disposed) return;

        if(this._messageHandler != null)
        {
            this._messageHandler.dispose();
            this._messageHandler = null;
        }

        if(this._singularController != null)
        {
            this._singularController.dispose();
            this._singularController = null;
        }

        this._notificationEvents.removeAllListeners();

        log.info('HabboNotifications disposed');

        super.dispose();
    }

    /**
	 * Called when all required dependencies are resolved.
	 * Creates the SingularNotificationController and NotificationMessageHandler.
	 */
    protected override initComponent(): void
    {
        this._singularController = new SingularNotificationController(this);
        this._messageHandler = new NotificationMessageHandler(this, this._communication!);

        log.info('HabboNotifications initialized');
    }
}

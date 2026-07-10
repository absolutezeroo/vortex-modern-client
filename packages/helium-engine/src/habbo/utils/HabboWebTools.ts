import {EventEmitter} from 'eventemitter3';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('HabboWebTools');

/**
 * Events emitted by HabboWebTools
 */
export interface IHabboWebToolsEvents
{
    'roomVisited': (roomId: number) => void;
    'logout': () => void;
    'disconnect': (reason: number, message: string) => void;
    'figureUpdated': (figure: string) => void;
    'subscriptionUpdated': (isActive: boolean) => void;
}

/**
 * Habbo Web Tools
 *
 * Static utility class for browser/web interaction.
 * In AS3 this used Flash ExternalInterface to communicate with the hosting page.
 * In Helium we use standard browser APIs (window.open, etc.) and emit events
 * for features that need to notify other parts of the application.
 *
 * @see source_as_win63/habbo/utils/HabboWebTools.as
 */
export class HabboWebTools
{
    public static readonly ADVERTISEMENT: string = 'advertisement';
    public static readonly WINDOW_HABBO_MAIN: string = 'habboMain';
    public static readonly OPEN_INTERNAL_LINK_FROM_WEB_CALLBACK: string = 'openlink';
    public static readonly GOTO_ROOM_FROM_WEB_CALLBACK: string = 'openroom';
    public static readonly HABBLET_AVATARS: string = 'avatars';
    public static readonly HABBLET_MINI_MAIL: string = 'minimail';
    public static readonly HABBLET_ROOM_ENTER_AD: string = 'roomenterad';
    public static readonly HABBLET_NEWS: string = 'news';
    private static readonly _toolEvents = new EventEmitter<IHabboWebToolsEvents>();

    private static _baseUrl: string = '';

    static get baseUrl(): string
    {
        return HabboWebTools._baseUrl;
    }

    static set baseUrl(value: string)
    {
        HabboWebTools._baseUrl = value;
    }

    /**
	 * Event emitter for web tool events.
	 * Named `toolEvents` to avoid conflict with Component.events (see MEMORY.md).
	 */
    static get toolEvents(): EventEmitter<IHabboWebToolsEvents>
    {
        return HabboWebTools._toolEvents;
    }

    /**
	 * Open a web page in a named window/tab
	 *
	 * @param url The URL to open
	 * @param target The window target name (defaults to WINDOW_HABBO_MAIN)
	 */
    static openWebPage(url: string, target: string = ''): void
    {
        if(!url) return;

        if(!target)
        {
            target = HabboWebTools.WINDOW_HABBO_MAIN;
        }

        const resolvedUrl = HabboWebTools.resolveUrl(url);
        window.open(resolvedUrl, target);
    }

    /**
	 * Open a page in the main habbo window
	 *
	 * @param url The URL to open
	 */
    static openPage(url: string): void
    {
        if(!url) return;

        const resolvedUrl = HabboWebTools.resolveUrl(url);
        window.open(resolvedUrl, HabboWebTools.WINDOW_HABBO_MAIN);
    }

    /**
	 * Open a web page and minimize the client
	 *
	 * @param url The URL to open
	 */
    static openWebPageAndMinimizeClient(url: string): void
    {
        if(!url) return;

        const resolvedUrl = HabboWebTools.resolveUrl(url);
        window.open(resolvedUrl, HabboWebTools.WINDOW_HABBO_MAIN);
    }

    /**
	 * Open an external link with a warning dialog
	 *
	 * @param url The external URL to open
	 */
    static openExternalLinkWarning(url: string): void
    {
        if(!url) return;

        window.open(url, HabboWebTools.WINDOW_HABBO_MAIN);
    }

    /**
	 * Log an event to the web page
	 *
	 * @param message The event message to log
	 */
    static logEventLog(message: string): void
    {
        log.debug('EventLog: ' + message);
    }

    /**
	 * Send a heartbeat signal (no-op in browser context)
	 */
    static sendHeartBeat(): void
    {
        // No-op: Flash ExternalInterface heartbeat not needed in browser
    }

    /**
	 * Notify that a room was visited
	 *
	 * @param roomId The visited room ID
	 */
    static roomVisited(roomId: number): void
    {
        HabboWebTools._toolEvents.emit('roomVisited', roomId);

        log.debug('Room visited: ' + roomId);
    }

    /**
	 * Trigger a logout
	 */
    static logOut(): void
    {
        HabboWebTools._toolEvents.emit('logout');

        log.debug('Logout requested');
    }

    /**
	 * Send a disconnect notification to the web layer
	 *
	 * @param reason The disconnect reason code
	 * @param message The disconnect message
	 */
    static sendDisconnectToWeb(reason: number, message: string): void
    {
        HabboWebTools._toolEvents.emit('disconnect', reason, message);

        log.debug('Disconnect: reason=' + reason + ', message=' + message);
    }

    /**
	 * Notify that the user's figure was updated
	 *
	 * @param figure The new figure string
	 */
    static updateFigure(figure: string): void
    {
        HabboWebTools._toolEvents.emit('figureUpdated', figure);

        log.debug('Figure updated: ' + figure);
    }

    /**
	 * Notify that the user's club subscription status changed
	 *
	 * @param isActive Whether the club subscription is currently active
	 * @see sources/win63_version/habbo/catalog/HabboCatalog.as::onSubscriptionInfo() (ExternalInterface.call("FlashExternalInterface.subscriptionUpdated", ...))
	 */
    static subscriptionUpdated(isActive: boolean): void
    {
        HabboWebTools._toolEvents.emit('subscriptionUpdated', isActive);

        log.debug('Subscription updated: ' + isActive);
    }

    /**
	 * Open a web habblet
	 *
	 * @param habblet The habblet type to open
	 * @param params Optional parameters
	 */
    static openWebHabblet(habblet: string, params?: string): void
    {
        log.debug('openWebHabblet: ' + habblet + (params ? ', params=' + params : ''));
    }

    /**
	 * Close a web habblet
	 *
	 * @param habblet The habblet type to close
	 * @param params Optional parameters
	 */
    static closeWebHabblet(habblet: string, params?: string): void
    {
        log.debug('closeWebHabblet: ' + habblet + (params ? ', params=' + params : ''));
    }

    /**
	 * Open the minimail habblet
	 *
	 * @param params Optional parameters
	 */
    static openMinimail(params?: string): void
    {
        HabboWebTools.openWebHabblet(HabboWebTools.HABBLET_MINI_MAIL, params);
    }

    /**
	 * Open the news habblet
	 */
    static openNews(): void
    {
        HabboWebTools.openWebHabblet(HabboWebTools.HABBLET_NEWS);
    }

    /**
	 * Close the news habblet
	 */
    static closeNews(): void
    {
        HabboWebTools.closeWebHabblet(HabboWebTools.HABBLET_NEWS);
    }

    /**
	 * Open the avatars page
	 */
    static openAvatars(): void
    {
        HabboWebTools.openWebHabblet(HabboWebTools.HABBLET_AVATARS);
    }

    /**
	 * Open the room enter ad
	 */
    static openRoomEnterAd(): void
    {
        HabboWebTools.openWebHabblet(HabboWebTools.HABBLET_ROOM_ENTER_AD, '');
    }

    /**
	 * Show an external game
	 *
	 * @param gameId The game identifier
	 */
    static showGame(gameId: string): void
    {
        log.debug('showGame: ' + gameId);
    }

    /**
	 * Hide the external game
	 */
    static hideGame(): void
    {
        log.debug('hideGame');
    }

    /**
	 * Resolve a URL: if it starts with "http", use as-is; otherwise prepend baseUrl
	 */
    private static resolveUrl(url: string): string
    {
        if(url.indexOf('http') === 0)
        {
            return url;
        }

        return HabboWebTools._baseUrl + '/' + url;
    }
}

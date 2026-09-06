import {EventEmitter} from 'eventemitter3';

import {DiscordRichPresenceEvent} from './events/DiscordRichPresenceEvent';
import {DiscordRpcSocket} from './DiscordRpcSocket';

/**
 * The `flash.events.StatusEvent` the native extension raises. `code` is one of the `EVENT_*`
 * constants below; `level` carries the JSON payload, which is why `extractPayloadData()` parses it.
 *
 * AS3: flash.events.StatusEvent
 */
export interface IDiscordStatusEvent
{
    code: string;
    level: string;
}

/**
 * The surface of the AIR native extension this class drives — `flash.external.ExtensionContext`.
 *
 * AS3: flash.external.ExtensionContext
 */
type ExtensionContext = {
    call(method: string, ...rest: unknown[]): unknown;
    addEventListener(type: string, listener: (event: IDiscordStatusEvent) => void): void;
    removeEventListener(type: string, listener: (event: IDiscordStatusEvent) => void): void;
    dispose(): void;
};

/**
 * Discord Rich Presence, driven through an AIR native extension.
 *
 * DEVIATION: AS3 loads `com.sulake.discord.richpresence`, an AIR native extension that speaks to
 *   Discord's IPC socket (`\\.\pipe\discord-ipc-0` / `$XDG_RUNTIME_DIR/discord-ipc-0`). Neither
 *   exists in a browser: `flash.external.ExtensionContext` is AIR-only, and a web page cannot open
 *   a named pipe or a unix socket at all. The port substitutes {@link DiscordRpcSocket}, which
 *   speaks the same RPC protocol over the Discord client's local WebSocket
 *   (`ws://127.0.0.1:6463..6472`) — the one transport reachable from a page, and one that still
 *   asks the player to install nothing beyond Discord.
 *
 *   Everything above `_context` is untouched, because the extension's surface is exactly what the
 *   adapter implements: five `call()` methods and a `status` event. What *does* change is that a
 *   native `call()` returns its result inline and a socket cannot, so `initialize()` and the three
 *   presence methods now answer "accepted" rather than "delivered" — see `DiscordRpcSocket`'s
 *   docblock, and note that the only consumer, `HabboDiscordManager`, already waits for the
 *   `DISCORD_CONNECTED` status event before it publishes anything.
 *
 *   `isSupported` still reports the platform test faithfully (Windows/macOS), which is also where
 *   the Discord desktop client runs.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/discord/DiscordRichPresence.as
 */
export class DiscordRichPresence extends EventEmitter
{
    // AS3: .../discord/DiscordRichPresence.as::_SafeStr_10818 (name derived from its value)
    private static readonly EXTENSION_ID: string = 'com.sulake.discord.richpresence';

    // AS3: .../discord/DiscordRichPresence.as::_SafeStr_4847 (name derived: the singleton)
    private static _instance: DiscordRichPresence | null = null;

    // AS3: .../discord/DiscordRichPresence.as::_SafeStr_11377 (name derived from its value)
    public static readonly EVENT_CONNECTED: string = 'DISCORD_CONNECTED';

    // AS3: .../discord/DiscordRichPresence.as::_SafeStr_11543 (name derived from its value)
    public static readonly EVENT_ERROR: string = 'DISCORD_ERROR';

    // AS3: .../discord/DiscordRichPresence.as::_SafeStr_11046 (name derived from its value)
    public static readonly EVENT_SHUTDOWN: string = 'DISCORD_SHUTDOWN';

    // AS3: .../discord/DiscordRichPresence.as::EVENT_ACTIVITY_JOIN
    public static readonly EVENT_ACTIVITY_JOIN: string = 'DISCORD_ACTIVITY_JOIN';

    // AS3: .../discord/DiscordRichPresence.as::EVENT_ACTIVITY_JOIN_REQUEST
    public static readonly EVENT_ACTIVITY_JOIN_REQUEST: string = 'DISCORD_ACTIVITY_JOIN_REQUEST';

    // AS3: .../discord/DiscordRichPresence.as::_SafeStr_11252 (name derived from its value)
    public static readonly EVENT_ACTIVITY_SPECTATE: string = 'DISCORD_ACTIVITY_SPECTATE';

    // AS3: .../discord/DiscordRichPresence.as::IS_SUPPORTED
    private static readonly IS_SUPPORTED: boolean = DiscordRichPresence.isDesktopSupported();

    // AS3: .../discord/DiscordRichPresence.as::_context
    private _context: ExtensionContext | null = null;

    // AS3: .../discord/DiscordRichPresence.as::_SafeStr_7311 (name derived: the "usable" latch)
    private _supported: boolean;

    // AS3: .../discord/DiscordRichPresence.as::DiscordRichPresence()
    constructor()
    {
        super();

        if(DiscordRichPresence._instance !== null)
        {
            throw new Error('DiscordRichPresence is a singleton. Use DiscordRichPresence.instance instead.');
        }

        this._supported = DiscordRichPresence.IS_SUPPORTED;

        if(this._supported)
        {
            this._context = DiscordRichPresence.createExtensionContext(DiscordRichPresence.EXTENSION_ID);

            if(this._context !== null)
            {
                this._context.addEventListener('status', this.forwardStatusEvent);
            }
            else
            {
                this._supported = false;
            }
        }

        DiscordRichPresence._instance = this;
    }

    // AS3: .../discord/DiscordRichPresence.as::get instance()
    static get instance(): DiscordRichPresence
    {
        if(DiscordRichPresence._instance === null)
        {
            DiscordRichPresence._instance = new DiscordRichPresence();
        }

        return DiscordRichPresence._instance;
    }

    // AS3: .../discord/DiscordRichPresence.as::get isSupported()
    static get isSupported(): boolean
    {
        return DiscordRichPresence.IS_SUPPORTED;
    }

    /**
	 * AS3 reads `flash.system.Capabilities.version`, whose first three characters are the platform
	 * ("WIN", "MAC", "LNX", "AND", "IOS"). The browser equivalent is the UA platform string.
	 */
    // AS3: .../discord/DiscordRichPresence.as::isDesktopSupported()
    private static isDesktopSupported(): boolean
    {
        const platform = typeof navigator === 'undefined' ? '' : navigator.platform ?? '';

        return platform.indexOf('Win') === 0 || platform.indexOf('Mac') === 0;
    }

    /**
	 * AS3: `ExtensionContext.createExtensionContext(id, null)`. There is no AIR runtime and no
	 * extension to load, so the id is unused and the context is {@link DiscordRpcSocket} — the same
	 * five methods over Discord's local RPC WebSocket instead of over its IPC pipe.
	 *
	 * `WebSocket` is the one thing it needs and the one thing a non-browser host might not have
	 * (a unit test, an SSR pass), so its absence returns null and leaves the class inert exactly as
	 * an AIR-less runtime did before.
	 */
    // AS3: .../discord/DiscordRichPresence.as::DiscordRichPresence()
    private static createExtensionContext(_extensionId: string): ExtensionContext | null
    {
        if(typeof WebSocket === 'undefined') return null;

        return new DiscordRpcSocket();
    }

    // AS3: .../discord/DiscordRichPresence.as::dispose()
    dispose(): void
    {
        if(this._context !== null)
        {
            this._context.removeEventListener('status', this.forwardStatusEvent);
            this._context.dispose();
            this._context = null;
        }

        DiscordRichPresence._instance = null;
    }

    // AS3: .../discord/DiscordRichPresence.as::initialize()
    initialize(clientId: string): boolean
    {
        if(clientId === null || clientId.length === 0)
        {
            throw new Error('clientId must be a non-empty string.');
        }

        return Boolean(this.callContext('initialize', clientId));
    }

    // AS3: .../discord/DiscordRichPresence.as::updatePresence()
    updatePresence(presence: object | null): boolean
    {
        const payload = presence !== null ? JSON.stringify(presence) : '{}';

        return Boolean(this.callContext('updatePresence', payload));
    }

    // AS3: .../discord/DiscordRichPresence.as::clearPresence()
    clearPresence(): boolean
    {
        return Boolean(this.callContext('clearPresence'));
    }

    // AS3: .../discord/DiscordRichPresence.as::shutdown()
    shutdown(): boolean
    {
        return Boolean(this.callContext('shutdown'));
    }

    // AS3: .../discord/DiscordRichPresence.as::respondToJoinRequest()
    respondToJoinRequest(userId: string, accept: boolean): boolean
    {
        if(userId === null || userId.length === 0)
        {
            throw new Error('userId must be a non-empty string.');
        }

        return Boolean(this.callContext('respondJoinRequest', userId, accept));
    }

    // AS3: .../discord/DiscordRichPresence.as::addStatusListener()
    addStatusListener(listener: (event: IDiscordStatusEvent) => void): void
    {
        this.on('status', listener);
    }

    // AS3: .../discord/DiscordRichPresence.as::removeStatusListener()
    removeStatusListener(listener: (event: IDiscordStatusEvent) => void): void
    {
        this.off('status', listener);
    }

    // AS3: .../discord/DiscordRichPresence.as::addJoinListener()
    addJoinListener(listener: (event: DiscordRichPresenceEvent) => void): void
    {
        this.on(DiscordRichPresenceEvent.JOIN, listener);
    }

    // AS3: .../discord/DiscordRichPresence.as::removeJoinListener()
    removeJoinListener(listener: (event: DiscordRichPresenceEvent) => void): void
    {
        this.off(DiscordRichPresenceEvent.JOIN, listener);
    }

    // AS3: .../discord/DiscordRichPresence.as::addJoinRequestListener()
    addJoinRequestListener(listener: (event: DiscordRichPresenceEvent) => void): void
    {
        this.on(DiscordRichPresenceEvent.JOIN_REQUEST, listener);
    }

    // AS3: .../discord/DiscordRichPresence.as::removeJoinRequestListener()
    removeJoinRequestListener(listener: (event: DiscordRichPresenceEvent) => void): void
    {
        this.off(DiscordRichPresenceEvent.JOIN_REQUEST, listener);
    }

    // AS3: .../discord/DiscordRichPresence.as::addSpectateListener()
    addSpectateListener(listener: (event: DiscordRichPresenceEvent) => void): void
    {
        this.on(DiscordRichPresenceEvent.SPECTATE, listener);
    }

    // AS3: .../discord/DiscordRichPresence.as::removeSpectateListener()
    removeSpectateListener(listener: (event: DiscordRichPresenceEvent) => void): void
    {
        this.off(DiscordRichPresenceEvent.SPECTATE, listener);
    }

    // AS3: .../discord/DiscordRichPresence.as::callContext()
    private callContext(method: string, ...rest: unknown[]): unknown
    {
        if(!this._supported)
        {
            return false;
        }

        if(this._context === null)
        {
            throw new Error('Extension context has been disposed.');
        }

        return this._context.call(method, ...rest);
    }

    // AS3: .../discord/DiscordRichPresence.as::forwardStatusEvent()
    private forwardStatusEvent = (event: IDiscordStatusEvent): void =>
    {
        this.emit('status', event);

        switch(event.code)
        {
            case DiscordRichPresence.EVENT_ACTIVITY_JOIN:
                this.dispatchJoinEvent(event.level);
                break;
            case DiscordRichPresence.EVENT_ACTIVITY_JOIN_REQUEST:
                this.dispatchJoinRequestEvent(event.level);
                break;
            case DiscordRichPresence.EVENT_ACTIVITY_SPECTATE:
                this.dispatchSpectateEvent(event.level);
                break;
        }
    };

    // AS3: .../discord/DiscordRichPresence.as::dispatchJoinEvent()
    private dispatchJoinEvent(raw: string): void
    {
        const data = DiscordRichPresence.extractPayloadData(raw);

        if(data === null || data.secret === undefined) return;

        this.emit(
            DiscordRichPresenceEvent.JOIN,
            new DiscordRichPresenceEvent(DiscordRichPresenceEvent.JOIN, String(data.secret), null, data)
        );
    }

    // AS3: .../discord/DiscordRichPresence.as::dispatchJoinRequestEvent()
    private dispatchJoinRequestEvent(raw: string): void
    {
        const data = DiscordRichPresence.extractPayloadData(raw);

        if(data === null || data.user === undefined) return;

        this.emit(
            DiscordRichPresenceEvent.JOIN_REQUEST,
            new DiscordRichPresenceEvent(
                DiscordRichPresenceEvent.JOIN_REQUEST,
                data.secret !== undefined ? String(data.secret) : '',
                data.user as Record<string, unknown>,
                data
            )
        );
    }

    // AS3: .../discord/DiscordRichPresence.as::dispatchSpectateEvent()
    private dispatchSpectateEvent(raw: string): void
    {
        const data = DiscordRichPresence.extractPayloadData(raw);

        if(data === null || data.secret === undefined) return;

        this.emit(
            DiscordRichPresenceEvent.SPECTATE,
            new DiscordRichPresenceEvent(DiscordRichPresenceEvent.SPECTATE, String(data.secret), null, data)
        );
    }

    // AS3: .../discord/DiscordRichPresence.as::extractPayloadData()
    private static extractPayloadData(raw: string): Record<string, unknown> | null
    {
        if(raw === null || raw.length === 0) return null;

        const parsed = DiscordRichPresence.safeParse(raw);

        if(parsed === null || parsed.data === undefined) return null;

        return parsed.data as Record<string, unknown>;
    }

    // AS3: .../discord/DiscordRichPresence.as::safeParse()
    private static safeParse(raw: string): Record<string, unknown> | null
    {
        try
        {
            return JSON.parse(raw) as Record<string, unknown>;
        }
        catch
        {
            return null;
        }
    }
}

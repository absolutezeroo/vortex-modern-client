import {EventEmitter} from 'eventemitter3';

import {DiscordRichPresenceEvent} from './events/DiscordRichPresenceEvent';

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
 * DEVIATION: `createExtensionContext()` below always returns `null`, so every call this class makes
 *   returns `false` and no presence is ever published. That is not a shortcut — it is what the AS3
 *   itself does outside AIR. `flash.external.ExtensionContext` exists only in the AIR desktop
 *   runtime; in the browser build `createExtensionContext("com.sulake.discord.richpresence", null)`
 *   returns null, the constructor's `else` branch clears `_supported`, and `callContext()` then
 *   short-circuits to `false` on its first line. Discord RPC talks to a local IPC socket
 *   (`\\.\pipe\discord-ipc-0` / `$XDG_RUNTIME_DIR/discord-ipc-0`), which a web page cannot open at
 *   all, so there is no browser equivalent to substitute — only a native host could provide one,
 *   and that host is what `_context` is the seam for.
 *
 *   `isSupported` still reports the platform test faithfully (Windows/macOS), because
 *   `HabboDiscordManager` uses it to decide whether to build the singleton at all, and AS3's web
 *   build answers `true` there too — the instance is created, finds no extension, and stays inert.
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
	 * AS3: `ExtensionContext.createExtensionContext(id, null)`. There is no AIR runtime here and no
	 * browser API that can reach Discord's local IPC socket, so this is the one place the port
	 * cannot follow — see the class docblock. A native host would fill it in.
	 */
    // AS3: .../discord/DiscordRichPresence.as::DiscordRichPresence()
    private static createExtensionContext(_extensionId: string): ExtensionContext | null
    {
        return null;
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

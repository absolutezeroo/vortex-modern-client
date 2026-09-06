import {Logger} from '@core/utils/Logger';

import type {IDiscordStatusEvent} from './DiscordRichPresence';

const log = Logger.getLogger('discord.DiscordRpcSocket');

/**
 * One frame of Discord's RPC v1 protocol. `cmd` names the command, `evt` is set on dispatches and
 * on errors, `nonce` correlates a reply with its request.
 */
// TS-only: no AS3 counterpart; the AS3 side speaks to a native extension, which frames for it.
interface IRpcFrame
{
    cmd?: string;
    evt?: string | null;
    nonce?: string | null;
    data?: Record<string, unknown>;
    args?: Record<string, unknown>;
}

/**
 * Discord Rich Presence over the Discord client's **local RPC WebSocket**, which is the only
 * transport a web page can reach: Rich Presence normally rides an IPC socket
 * (`\\.\pipe\discord-ipc-0`), and a browser cannot open one.
 *
 * The Discord desktop client listens on `ws://127.0.0.1:6463..6472`. Loopback counts as a
 * potentially-trustworthy origin, so an `https://` page may open a `ws://` connection to it — Chrome
 * and Edge allow this, and there is nothing to install on the player's machine beyond Discord
 * itself, which is the whole point of this transport.
 *
 * **Two things decide whether it works, and neither is code we control.**
 *
 * - Discord checks the page's `Origin` against the application's registered RPC origins. Add the
 *   hotel's origin under *Rich Presence → RPC origins* in the Discord developer portal, for the
 *   application whose id `HabboDiscordManager.DISCORD_CLIENT_ID` names, or the handshake is refused.
 * - `SET_ACTIVITY` is sent straight after `READY`, with no OAuth handshake — the same thing the
 *   native IPC clients do, and the reason this file needs no client secret and no server endpoint.
 *   If Discord instead answers that frame with an error, {@link handleFrame} logs it verbatim at
 *   `warn` with the code and message; an authentication complaint there is the signal that this
 *   application needs the whitelisted `rpc` OAuth scope, which is the one outcome that would force
 *   a token exchange (and therefore a server) into the picture.
 *
 * **`call()` is synchronous and the socket is not.** The AS3 side is a `flash.external.
 * ExtensionContext`, whose calls return a value inline; here every command is queued and flushed on
 * `READY`, and `call()` answers `true` for "accepted", never "delivered". That is not a loss: the
 * only caller, `DiscordRichPresence`, coerces the result to a boolean and drops it, and it learns
 * that the transport is live from the `DISCORD_CONNECTED` status event instead — which is exactly
 * how the native extension reports it too.
 */
// TS-only: no AS3 counterpart; this is the browser's replacement for the AIR native extension.
export class DiscordRpcSocket
{
    // TS-only: the port range the Discord client binds, tried in order.
    private static readonly FIRST_PORT: number = 6463;

    // TS-only: the port range the Discord client binds, tried in order.
    private static readonly LAST_PORT: number = 6472;

    /**
     * A closed loopback port refuses immediately, so this only fires when something is listening and
     * not answering — a stalled Discord, or another program on the port.
     */
    // TS-only: no AS3 counterpart; the native extension has no per-port handshake to time out.
    private static readonly HANDSHAKE_TIMEOUT_MS: number = 2000;

    // TS-only: mirrors DiscordRichPresence's EVENT_* constants, which are what listeners switch on.
    private static readonly EVENT_CONNECTED: string = 'DISCORD_CONNECTED';

    // TS-only: mirrors DiscordRichPresence.EVENT_ERROR.
    private static readonly EVENT_ERROR: string = 'DISCORD_ERROR';

    // TS-only: mirrors DiscordRichPresence.EVENT_SHUTDOWN.
    private static readonly EVENT_SHUTDOWN: string = 'DISCORD_SHUTDOWN';

    /**
     * The RPC dispatch names, and the status codes each is forwarded as. `DiscordRichPresence`
     * switches on the right-hand side; Discord sends the left.
     */
    // TS-only: no AS3 counterpart; the native extension does this mapping internally.
    private static readonly DISPATCH_EVENTS: ReadonlyMap<string, string> = new Map([
        ['ACTIVITY_JOIN', 'DISCORD_ACTIVITY_JOIN'],
        ['ACTIVITY_JOIN_REQUEST', 'DISCORD_ACTIVITY_JOIN_REQUEST'],
        ['ACTIVITY_SPECTATE', 'DISCORD_ACTIVITY_SPECTATE']
    ]);

    // TS-only: the listeners `DiscordRichPresence` registers through addEventListener().
    private _listeners: Array<(event: IDiscordStatusEvent) => void> = [];

    // TS-only: the live connection, null until a port answers and after shutdown.
    private _socket: WebSocket | null = null;

    // TS-only: set once READY arrives; until then every command waits in `_pending`.
    private _ready: boolean = false;

    // TS-only: commands issued before READY, flushed in order once it arrives.
    private _pending: IRpcFrame[] = [];

    // TS-only: the port currently being tried, so a refusal can move to the next one.
    private _port: number = DiscordRpcSocket.FIRST_PORT;

    // TS-only: cleared on open or on failure; see HANDSHAKE_TIMEOUT_MS.
    private _handshakeTimer: ReturnType<typeof setTimeout> | null = null;

    // TS-only: set by shutdown() and by dispose(), so a pending retry stops walking the port range.
    private _closed: boolean = false;

    /**
     * The AS3 surface: `initialize`, `updatePresence`, `clearPresence`, `shutdown` and
     * `respondJoinRequest`, named exactly as `DiscordRichPresence.callContext()` passes them.
     */
    // TS-only: implements the `call` member of DiscordRichPresence's ExtensionContext type.
    call(method: string, ...rest: unknown[]): unknown
    {
        switch(method)
        {
            case 'initialize':
                return this.connect(String(rest[0] ?? ''));

            case 'updatePresence':
                return this.send({
                    cmd: 'SET_ACTIVITY',
                    args: {pid: 0, activity: DiscordRpcSocket.parseActivity(String(rest[0] ?? '{}'))}
                });

            case 'clearPresence':
                // No `activity` key at all is how Discord is told to drop the presence; an empty
                // object would be read as an activity with no fields and stay on screen.
                return this.send({cmd: 'SET_ACTIVITY', args: {pid: 0}});

            case 'shutdown':
                this.closeSocket(true);

                return true;

            case 'respondJoinRequest':
                return this.send(
                    rest[1] === true
                        ? {cmd: 'SEND_ACTIVITY_JOIN_INVITE', args: {user_id: String(rest[0] ?? '')}}
                        : {cmd: 'CLOSE_ACTIVITY_REQUEST', args: {user_id: String(rest[0] ?? '')}}
                );

            default:
                log.warn(`Unhandled RPC method "${method}"`);

                return false;
        }
    }

    // TS-only: implements the `addEventListener` member of the ExtensionContext type.
    addEventListener(type: string, listener: (event: IDiscordStatusEvent) => void): void
    {
        if(type !== 'status') return;

        this._listeners.push(listener);
    }

    // TS-only: implements the `removeEventListener` member of the ExtensionContext type.
    removeEventListener(type: string, listener: (event: IDiscordStatusEvent) => void): void
    {
        if(type !== 'status') return;

        this._listeners = this._listeners.filter((entry) => entry !== listener);
    }

    // TS-only: implements the `dispose` member of the ExtensionContext type.
    dispose(): void
    {
        this.closeSocket(true);
        this._listeners = [];
    }

    /**
     * Opens the first port in the range that answers. A refused port is not an error — Discord binds
     * exactly one of the ten, and which one depends on how many Discord clients started before it.
     */
    // TS-only: no AS3 counterpart; the native extension is handed a pipe name, not a port range.
    private connect(clientId: string): boolean
    {
        if(clientId.length === 0)
        {
            log.warn('initialize() with an empty client id; not connecting');

            return false;
        }

        if(this._socket !== null) return true;

        this._closed = false;

        return this.openPort(clientId, this._port);
    }

    // TS-only: no AS3 counterpart; one attempt of the port walk started by connect().
    private openPort(clientId: string, port: number): boolean
    {
        if(this._closed || port > DiscordRpcSocket.LAST_PORT)
        {
            if(!this._closed)
            {
                log.debug(
                    `No Discord client answered on ports ${DiscordRpcSocket.FIRST_PORT}-`
                    + `${DiscordRpcSocket.LAST_PORT}; rich presence stays off`
                );
            }

            return false;
        }

        let socket: WebSocket;

        try
        {
            socket = new WebSocket(
                `ws://127.0.0.1:${port}/?v=1&client_id=${encodeURIComponent(clientId)}&encoding=json`
            );
        }
        catch (error)
        {
            // A browser that refuses ws:// from an https:// page throws here rather than firing
            // `error`, so the whole walk is pointless and stops on the spot.
            log.warn(`Cannot open a loopback WebSocket: ${String(error)}`);

            return false;
        }

        this._socket = socket;
        this._port = port;

        this._handshakeTimer = setTimeout(
            () => this.failPort(clientId, port, 'handshake timed out'),
            DiscordRpcSocket.HANDSHAKE_TIMEOUT_MS
        );

        socket.onmessage = (event: MessageEvent): void => this.handleFrame(String(event.data));
        socket.onerror = (): void => this.failPort(clientId, port, 'connection refused');

        socket.onclose = (event: CloseEvent): void =>
        {
            if(this._ready)
            {
                this._ready = false;
                this._socket = null;
                this.emit(DiscordRpcSocket.EVENT_SHUTDOWN, {});

                return;
            }

            // A 4xxx close is Discord itself refusing — wrong client id, or an origin that is not on
            // the application's RPC list. It means this port WAS the right one, so walking to the
            // next nine turns the one informative failure into "no Discord client answered", which
            // is the opposite diagnosis. Stop here and report what Discord said.
            if(event.code >= 4000 && event.code <= 4999)
            {
                this.clearHandshakeTimer();
                this._socket = null;
                this._closed = true;

                // 4000 is a client id Discord does not know; 4001 is a client id it DOES know
                // refusing this page's origin. Saying both every time sends the reader after the
                // suspect Discord has already cleared.
                const advice = event.code === 4001
                    ? 'the application is recognised, but this page\'s origin is not on its RPC '
                        + 'origins list — a list the developer portal only exposes once Discord has '
                        + 'granted the application RPC access'
                    : 'check that discord.client_id names an application you own';

                log.warn(
                    `Discord closed the RPC handshake on port ${port}: ${event.code} `
                    + `${event.reason || '(no reason given)'} — ${advice}`
                );

                this.emit(DiscordRpcSocket.EVENT_ERROR, {code: event.code, message: event.reason});

                return;
            }

            this.failPort(clientId, port, `closed before READY (${event.code})`);
        };

        return true;
    }

    /**
     * Moves to the next port. Both `error` and `close` fire for one refusal, and the timeout can
     * land on top, so this is written to run at most once per port.
     */
    // TS-only: no AS3 counterpart; see openPort().
    private failPort(clientId: string, port: number, reason: string): void
    {
        if(this._port !== port || this._socket === null) return;

        this.clearHandshakeTimer();

        const socket = this._socket;

        this._socket = null;
        socket.onopen = socket.onmessage = socket.onerror = socket.onclose = null;

        try
        {
            socket.close();
        }
        catch
        {
            // Already closing; nothing to do.
        }

        log.trace(`Port ${port}: ${reason}`);

        this.openPort(clientId, port + 1);
    }

    /**
     * Discord answers the handshake with a `READY` dispatch, replies to each command under the nonce
     * it was sent with, and pushes `ACTIVITY_*` dispatches for invites.
     */
    // TS-only: no AS3 counterpart; the native extension parses these frames itself.
    private handleFrame(raw: string): void
    {
        let frame: IRpcFrame;

        try
        {
            frame = JSON.parse(raw) as IRpcFrame;
        }
        catch
        {
            log.warn('Discord sent a frame that is not JSON; ignored');

            return;
        }

        if(frame.evt === 'READY')
        {
            this.clearHandshakeTimer();
            this._ready = true;

            log.debug(`Discord RPC ready on port ${this._port}`);

            for(const event of DiscordRpcSocket.DISPATCH_EVENTS.keys())
            {
                this.write({cmd: 'SUBSCRIBE', evt: event, args: {}});
            }

            const pending = this._pending;

            this._pending = [];

            for(const command of pending) this.write(command);

            this.emit(DiscordRpcSocket.EVENT_CONNECTED, frame.data ?? {});

            return;
        }

        if(frame.evt === 'ERROR')
        {
            const data = frame.data ?? {};

            // The one line worth reading when nothing shows up in Discord: an origin that is not on
            // the application's RPC list, or a command that turns out to need the `rpc` scope, both
            // arrive here with Discord's own wording.
            log.warn(
                `Discord refused ${frame.cmd ?? 'a command'}: `
                + `${String(data.code ?? '?')} ${String(data.message ?? '')}`
            );

            this.emit(DiscordRpcSocket.EVENT_ERROR, data);

            return;
        }

        const status = frame.evt !== null && frame.evt !== undefined
            ? DiscordRpcSocket.DISPATCH_EVENTS.get(frame.evt) ?? null
            : null;

        if(status !== null) this.emit(status, frame.data ?? {});
    }

    /**
     * Queues a command, or writes it if the handshake is done. Returns whether it was accepted, not
     * whether Discord received it — see the class docblock.
     */
    // TS-only: no AS3 counterpart; the native extension's calls are synchronous.
    private send(frame: IRpcFrame): boolean
    {
        if(this._closed) return false;

        if(!this._ready)
        {
            // Only the newest presence matters, so a burst that arrives before READY collapses
            // rather than replaying every intermediate state on connect.
            this._pending = this._pending.filter((entry) => entry.cmd !== frame.cmd);
            this._pending.push(frame);

            return true;
        }

        return this.write(frame);
    }

    // TS-only: no AS3 counterpart; the actual socket write, with a nonce Discord echoes back.
    private write(frame: IRpcFrame): boolean
    {
        if(this._socket === null || this._socket.readyState !== WebSocket.OPEN) return false;

        try
        {
            this._socket.send(JSON.stringify({...frame, nonce: DiscordRpcSocket.nonce()}));

            return true;
        }
        catch (error)
        {
            log.warn(`Failed to send ${frame.cmd ?? 'a frame'}: ${String(error)}`);

            return false;
        }
    }

    /**
     * `DiscordRichPresence` hands listeners a `level` that is a JSON string, and reads the payload
     * back out of its `data` key — so the envelope has to be rebuilt here.
     */
    // TS-only: no AS3 counterpart; the native extension raises flash.events.StatusEvent directly.
    private emit(code: string, data: Record<string, unknown>): void
    {
        const event: IDiscordStatusEvent = {code, level: JSON.stringify({data})};

        for(const listener of [...this._listeners])
        {
            try
            {
                listener(event);
            }
            catch (error)
            {
                log.warn(`A status listener threw: ${String(error)}`);
            }
        }
    }

    // TS-only: no AS3 counterpart; shared by shutdown(), dispose() and the port walk.
    private closeSocket(permanent: boolean): void
    {
        this.clearHandshakeTimer();

        if(permanent) this._closed = true;

        const socket = this._socket;

        this._socket = null;
        this._ready = false;
        this._pending = [];

        if(socket === null) return;

        socket.onopen = socket.onmessage = socket.onerror = socket.onclose = null;

        try
        {
            socket.close();
        }
        catch
        {
            // Already closing; nothing to do.
        }

        this.emit(DiscordRpcSocket.EVENT_SHUTDOWN, {});
    }

    // TS-only: no AS3 counterpart.
    private clearHandshakeTimer(): void
    {
        if(this._handshakeTimer === null) return;

        clearTimeout(this._handshakeTimer);
        this._handshakeTimer = null;
    }

    /**
     * The manager already builds Discord's own activity shape — `details`, `state`, `timestamps`,
     * `buttons` — so this only has to undo the JSON the AS3 signature forces it through.
     */
    // TS-only: no AS3 counterpart; the native extension takes the same JSON string.
    private static parseActivity(raw: string): Record<string, unknown>
    {
        try
        {
            return JSON.parse(raw) as Record<string, unknown>;
        }
        catch
        {
            log.warn('updatePresence() was given a payload that is not JSON; sending an empty one');

            return {};
        }
    }

    // TS-only: no AS3 counterpart; correlates a reply with its request.
    private static nonce(): string
    {
        return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    }
}

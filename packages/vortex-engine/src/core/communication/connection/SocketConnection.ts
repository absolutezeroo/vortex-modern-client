import {EventEmitter} from 'eventemitter3';
import {ByteArray} from '../util/ByteArray';
import {WireFormatter} from '../wireformat/WireFormatter';
import {MessageRegistry} from '../messages/MessageRegistry';
import {Logger} from '../../utils/Logger';
import type {IConnection} from './IConnection';
import type {IConnectionCallback} from './IConnectionCallback';
import type {IEncryption} from '../encryption/IEncryption';
import type {IMessageComposer} from '../messages/IMessageComposer';
import type {IMessageEvent} from '../messages/IMessageEvent';
import type {IMessageConfiguration} from '../messages/IMessageConfiguration';
import type {IMessageDataWrapper} from '../messages/IMessageDataWrapper';
import type {IWireFormatter} from '../wireformat/IWireFormatter';
import {PreEncryptionMessageComposer} from '../messages/PreEncryptionMessageComposer';
import {PacketLogger} from '../PacketLogger';

const log = Logger.getLogger('core.communication.connection.SocketConnection');

export interface IConnectionEvents
{
    connected: () => void;
    disconnected: () => void;
    error: (error: Error) => void;
    message: (messageId: number) => void;
    /**
	 * Emitted after a message is successfully parsed and before handlers are called
	 */
    messageEvent: (event: IMessageEvent) => void;
}

export class SocketConnection extends EventEmitter<IConnectionEvents> implements IConnection
{
    private _socket: WebSocket | null = null;
    private _receivedBuffer: ByteArray = new ByteArray();
    private _pendingMessages: ByteArray[] = [];
    private _pendingComposers: IMessageComposer<unknown[]>[] = [];
    private _pendingReceivedMessages: IMessageDataWrapper[] = [];

    private _clientToServerEncryption: IEncryption | null = null;
    private _serverToClientEncryption: IEncryption | null = null;
    private _authenticated: boolean = false;
    private _configurationReady: boolean = false;

    private _messageRegistry: MessageRegistry = new MessageRegistry();
    private _wireFormatter: IWireFormatter = new WireFormatter();
    private _timeoutId: ReturnType<typeof setTimeout> | null = null;
    private _callback: IConnectionCallback | null;
    private _host: string = '';
    private _port: number = 0;

    constructor(callback?: IConnectionCallback)
    {
        super();
        this._callback = callback ?? null;
    }

    private _connected: boolean = false;

    get connected(): boolean
    {
        return this._connected;
    }

    private _disposed: boolean = false;

    get disposed(): boolean
    {
        return this._disposed;
    }

    private _timeout: number = 10000;

    get timeout(): number
    {
        return this._timeout;
    }

    set timeout(value: number)
    {
        this._timeout = value;
    }

    init(host: string, port: number = 0, _tcpNoDelay: boolean = true): boolean
    {
        if(this._disposed)
        {
            return false;
        }

        this._host = host;
        this._port = port;
        this._callback?.connectionInit?.(host, port);

        let url: string;
        if(host.startsWith('ws://') || host.startsWith('wss://'))
        {
            if(host.startsWith('ws://'))
            {
                log.warn('Insecure WebSocket connection (ws://). Use wss:// in production.');
            }
            url = host;
        }
        else
        {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            url = port > 0 ? `${protocol}//${host}:${port}` : `${protocol}//${host}`;
        }

        try
        {
            this._socket = new WebSocket(url);
            this._socket.binaryType = 'arraybuffer';
            this.setupEventListeners();
            this.startTimeout();
            return true;
        }
        catch (error)
        {
            log.error(`WebSocket error: ${(error as Error).message}`);
            this._callback?.connectionError?.(error as Error);
            return false;
        }
    }

    createSocket(): void
    {
        this.close();
        this._receivedBuffer.clear();
        this._pendingMessages = [];
        this._clientToServerEncryption = null;
        this._serverToClientEncryption = null;
        this._socket = null;
    }

    addListener<T extends EventEmitter.EventNames<IConnectionEvents>>(
        type: T,
        listener: EventEmitter.EventListener<IConnectionEvents, T>,
        context?: unknown
    ): this;
    addListener(type: string, listener: (...args: unknown[]) => void, context?: unknown): this;
    addListener(type: string, listener: (...args: any[]) => void, context?: unknown): this
    {
        switch(type)
        {
            case 'connect':
                return super.addListener('connected', listener as EventEmitter.EventListener<IConnectionEvents, 'connected'>, context);
            case 'close':
                return super.addListener('disconnected', listener as EventEmitter.EventListener<IConnectionEvents, 'disconnected'>, context);
            case 'ioError':
            case 'securityError':
                return super.addListener('error', listener as EventEmitter.EventListener<IConnectionEvents, 'error'>, context);
            default:
                // TODO(AS3): sources/win63_version/core/communication/connection/IConnection.as addListener()
                // Map any additional Flash socket event names that are used by future ports.
                return super.addListener(
                    type as EventEmitter.EventNames<IConnectionEvents>,
                    listener as EventEmitter.EventListener<IConnectionEvents, EventEmitter.EventNames<IConnectionEvents>>,
                    context
                );
        }
    }

    send(composer: IMessageComposer<unknown[]>): boolean
    {
        if(this._disposed)
        {
            return false;
        }

        if(!this._clientToServerEncryption || (this._authenticated && !this._configurationReady))
        {
            this._pendingComposers.push(composer);
            return false;
        }

        const messageId = this._messageRegistry.getMessageIdForComposer(composer);
        if(messageId < 0)
        {
            log.warn(`Unknown composer: ${composer.constructor.name}`);
            return false;
        }

        PacketLogger.outgoing(messageId, composer.constructor.name);

        const encoded = this._wireFormatter.encode(messageId, composer.getMessageArray());

        this._clientToServerEncryption.encipher(encoded);

        return this.sendRaw(encoded, messageId);
    }

    sendUnencrypted(composer: IMessageComposer<unknown[]>): boolean
    {
        if(this._disposed)
        {
            return false;
        }

        const messageId = this._messageRegistry.getMessageIdForComposer(composer);
        if(messageId < 0)
        {
            log.warn(`Unknown composer: ${composer.constructor.name}`);
            return false;
        }

        if(!(composer instanceof PreEncryptionMessageComposer))
        {
            return false;
        }

        const encoded = this._wireFormatter.encode(messageId, composer.getMessageArray());
        return this.sendRaw(encoded, messageId);
    }

    setEncryption(clientToServer: IEncryption, serverToClient: IEncryption): void
    {
        this._clientToServerEncryption = clientToServer;
        this._serverToClientEncryption = serverToClient;
    }

    isAuthenticated(): void
    {
        this._authenticated = true;

        this.flushPendingComposers();
    }

    isConfigured(): void
    {
        this._configurationReady = true;

        this.flushPendingReceivedMessages();
        this.flushPendingComposers();
    }

    getServerToClientEncryption(): IEncryption | null
    {
        return this._serverToClientEncryption;
    }

    getClientToServerEncryption(): IEncryption | null
    {
        return this._clientToServerEncryption;
    }

    registerMessageClasses(config: IMessageConfiguration): void
    {
        this._messageRegistry.registerMessages(config);
    }

    addMessageEvent(event: IMessageEvent): void
    {
        this._messageRegistry.registerMessageEvent(event);
    }

    removeMessageEvent(event: IMessageEvent): void
    {
        this._messageRegistry.unregisterMessageEvent(event);
    }

    processReceivedData(): void
    {
        if(this._receivedBuffer.length === 0)
        {
            return;
        }

        this._receivedBuffer.position = 0;

        try
        {
            const messages = this._wireFormatter.splitMessages(this._receivedBuffer, this);

            for(const wrapper of messages)
            {
                const messageId = wrapper.getMessageId();

                this.emit('message', messageId);
                this._callback?.messageReceived?.(String(0));

                if(this._authenticated && !this._configurationReady)
                {
                    this._pendingReceivedMessages.push(wrapper);
                    continue;
                }

                this.handleReceivedMessage(wrapper);
            }
        }
        catch (error)
        {
            log.error(`Process error: ${(error as Error).message}`);

            // AS3 (class_1752.as::processReceivedData()) re-throws this error after notifying
            // messageParseError() - an invalid message length means the byte stream is desynced
            // beyond recovery (WireFormatter.splitMessages() already consumed part of the encryption
            // keystream via decipher() before throwing, and never compacts/clears the buffer on this
            // path). Swallowing it here without disconnecting means every subsequent frame re-parses
            // the same corrupted buffer from position 0 with an already-advanced keystream, producing
            // a new garbage length value forever - an infinite console-spamming loop, not a recoverable
            // condition. Treat it as fatal: clear the buffer and close the connection.
            this._receivedBuffer.clear();
            this._callback?.connectionError?.(error as Error);
            this.emit('error', error as Error);
            this.close();
        }
    }

    close(): void
    {
        this.clearTimeout();

        if(this._socket)
        {
            if(this._socket.readyState === WebSocket.OPEN)
            {
                this._socket.close();
            }
            this._socket = null;
        }

        this._connected = false;
    }

    dispose(): void
    {
        if(this._disposed)
        {
            return;
        }

        this.close();
        this._receivedBuffer.clear();
        this._pendingMessages = [];
        this._pendingComposers = [];
        this._pendingReceivedMessages = [];
        this._messageRegistry.clear();
        this._wireFormatter.dispose();
        this._clientToServerEncryption = null;
        this._serverToClientEncryption = null;
        this._authenticated = false;
        this._configurationReady = false;
        this._callback = null;
        this.removeAllListeners();

        this._disposed = true;
    }

    private setupEventListeners(): void
    {
        if(!this._socket)
        {
            return;
        }

        this._socket.onopen = () =>
        {
            this.clearTimeout();
            this._connected = true;
            this._callback?.connectionOpened?.();
            this.emit('connected');
            this.flushPendingMessages();
        };

        this._socket.onclose = (event) =>
        {
            // The close code is the only evidence of *why* the link went away, and it is gone the
            // moment this handler returns. 1000/1001 = someone closed it deliberately (server
            // shutdown, navigation); 1006 = no close frame at all, i.e. the TCP connection died —
            // which is what a backgrounded tab, a sleeping machine or a dropped route looks like.
            // Without this the disconnect was indistinguishable from every other disconnect.
            log.warn(
                `Connection closed: code=${event.code} reason="${event.reason}" clean=${event.wasClean}`
                + (event.code === 1006 ? ' — no close frame; the transport dropped rather than the peer closing' : '')
            );

            this.clearTimeout();
            this._connected = false;
            this._callback?.connectionClosed?.();
            this.emit('disconnected');
        };

        this._socket.onerror = () =>
        {
            const error = new Error('WebSocket error');
            this._callback?.connectionError?.(error);
            this.emit('error', error);
        };

        this._socket.onmessage = (event) =>
        {
            if(!event.data)
            {
                return;
            }

            if(event.data instanceof Blob)
            {
                const reader = new FileReader();
                reader.readAsArrayBuffer(event.data);
                reader.onloadend = () =>
                {
                    this.onDataReceived(reader.result as ArrayBuffer);
                };
            }
            else if(event.data instanceof ArrayBuffer)
            {
                this.onDataReceived(event.data);
            }
        };
    }

    private onDataReceived(data: ArrayBuffer): void
    {
        const bytes = ByteArray.fromArrayBuffer(data);
        const oldPosition = this._receivedBuffer.position;
        this._receivedBuffer.position = this._receivedBuffer.length;
        this._receivedBuffer.writeBytes(bytes);
        this._receivedBuffer.position = oldPosition;

        // Process on arrival, driven by the WebSocket 'message' event, NOT only by the
        // ticker-driven update loop (CoreCommunicationManager.update -> processReceivedData).
        //
        // AS3 parity note: the Flash client also drained the socket from an update loop
        // (class_44.update -> processReceivedData), and this port faithfully mirrors that. But the
        // browser fully PAUSES requestAnimationFrame (which drives the Pixi ticker, hence that
        // update loop) whenever the tab is backgrounded, whereas Flash Player kept a hidden SWF
        // running (throttled, ~4fps) so its loop never stalled. The result was: switch tabs for
        // ~30s and the ticker froze -> processReceivedData stopped -> incoming packets piled up in
        // _receivedBuffer unprocessed while the room appeared frozen, needing a reconnect. The
        // 'message' event keeps firing on a backgrounded tab, so processing here restores the
        // Flash behaviour (network keeps up regardless of render throttling). splitMessages()
        // already buffers partial frames, so a fragmented arrival is safe. The ticker still calls
        // processReceivedData() too; it simply finds an empty buffer most of the time now.
        this.processReceivedData();
    }

    private startTimeout(): void
    {
        this.clearTimeout();
        this._timeoutId = setTimeout(() =>
        {
            if(!this._connected && this._socket)
            {
                this._socket.close();
                const error = new Error('Connection timeout');
                this._callback?.connectionError?.(error);
                this.emit('error', error);
            }
        }, this._timeout);
    }

    private clearTimeout(): void
    {
        if(this._timeoutId)
        {
            clearTimeout(this._timeoutId);
            this._timeoutId = null;
        }
    }

    private sendRaw(data: ByteArray, messageId?: number): boolean
    {
        if(!this._socket)
        {
            return false;
        }

        // Queue only while the socket has NEVER been open — the port connects asynchronously where
        // Flash called send() after connect, so a message composed during the handshake window has
        // to wait for onopen. CONNECTING is exactly that window and nothing else.
        if(this._socket.readyState === WebSocket.CONNECTING)
        {
            this._pendingMessages.push(data.clone());
            return true;
        }

        // AS3: SocketConnection.as::send() l.222-229 — `if(_socket.connected) { write } else
        // return false`. There is no queue on this path in AS3, and adding one was actively
        // harmful: `onclose` leaves `_socket` non-null and only clears `_connected`, so a
        // connection lost while the tab was hidden sent every later action into `_pendingMessages`
        // and reported success. Nothing ever flushes that queue (only `onopen` does, and there is
        // no reconnect), so the client looked alive while silently swallowing every click — the
        // "came back to the tab and can do nothing, have to reconnect" symptom.
        if(this._socket.readyState !== WebSocket.OPEN)
        {
            log.once('send-after-close').warn(
                'Send attempted on a closed connection — the socket went away and nothing reconnects. '
                + 'Every action from here on is dropped until the page is reloaded.'
            );

            return false;
        }

        try
        {
            this._socket.send(data.toArrayBuffer());
            if(messageId !== undefined)
            {
                this._callback?.messageSent?.(String(messageId));
            }
            return true;
        }
        catch (error)
        {
            log.error(`Send error: ${(error as Error).message}`);
            return false;
        }
    }

    private flushPendingMessages(): void
    {
        while(this._pendingMessages.length > 0)
        {
            const message = this._pendingMessages.shift()!;
            this.sendRaw(message);
        }
    }

    private flushPendingComposers(): void
    {
        if(!this._clientToServerEncryption || !this._configurationReady)
        {
            return;
        }

        const composers = this._pendingComposers;
        this._pendingComposers = [];

        for(const composer of composers)
        {
            this.send(composer);
        }
    }

    private flushPendingReceivedMessages(): void
    {
        const messages = this._pendingReceivedMessages;
        this._pendingReceivedMessages = [];

        for(const message of messages)
        {
            this.handleReceivedMessage(message);
        }
    }

    private handleReceivedMessage(wrapper: IMessageDataWrapper): void
    {
        const messageId = wrapper.getMessageId();
        const events = this._messageRegistry.getMessageEventsForId(messageId);

        PacketLogger.incoming(messageId, this._messageRegistry.getIncomingMessageName(messageId), events?.length ?? 0);

        if(!events || events.length === 0)
        {
            log.debug(`No registered handler for incoming message id ${messageId} (${this._messageRegistry.getIncomingMessageName(messageId)})`);
            return;
        }

        const parser = events[0].parser;

        if(!parser)
        {
            return;
        }

        try
        {
            parser.flush();

            if(parser.parse(wrapper))
            {
                for(const event of events)
                {
                    event.connection = this;
                    this.emit('messageEvent', event);

                    try
                    {
                        event.callback(event);
                    }
                    catch (error)
                    {
                        log.error(`Handler error for ${messageId}: ${(error as Error).message}`, error);
                    }
                }
            }
        }
        catch (error)
        {
            log.error(`Parse error for ${messageId}: ${(error as Error).message}`, error);
            this._callback?.messageParseError?.(wrapper);
        }
    }
}

import {Component, ComponentDependency, type IContext} from '@core/runtime';
import {ArcFour} from '@habbo/communication/encryption/ArcFour';
import {DiffieHellman} from '@habbo/communication/encryption/DiffieHellman';
import {Logger} from '@core/utils/Logger';
import {HabboMessages} from './HabboMessages';
import {SessionDataManager} from '../session/SessionDataManager';
import type { HabboCommunicationEventType} from './enum/HabboCommunicationEvent';
import {HabboCommunicationEvent} from './enum/HabboCommunicationEvent';
import type {IHabboCommunicationManager} from './IHabboCommunicationManager';
import type {ICoreCommunicationManager} from '@core/communication/ICoreCommunicationManager';
import type {IConnection} from '@core/communication/connection/IConnection';
import type {IConnectionCallback} from '@core/communication/connection/IConnectionCallback';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {IMessageConfiguration} from '@core/communication/messages/IMessageConfiguration';
import type {IEncryption} from '@core/communication/encryption/IEncryption';
import type {IKeyExchange} from '@core/communication/handshake/IKeyExchange';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {ISessionDataManager} from '../session/ISessionDataManager';
import type {IConnectionActions} from './IConnectionActions';
import type {IHabboWebApiListener} from './IHabboWebApiListener';
import type {IHabboWebApiSession} from './IHabboWebApiSession';
import {HabboWebApiSession} from './HabboWebApiSession';
import {IID_CoreCommunicationManager} from "@iid/IIDCoreCommunicationManager";
import {ErrorReportStorage} from '@core/utils/ErrorReportStorage';

const log = Logger.getLogger('Communication');

export interface IHabboConnectionConfig
{
    host: string;
    ports: number[];
    ssoTicket?: string;
}

/**
 * Habbo Communication Manager
 *
 * Based on AS3: com.sulake.habbo.communication.HabboCommunicationManager
 *
 * Uses Component.events as the central event dispatcher for communication-related
 * events like AUTHENTICATED, HANDSHAKED, etc.
 */
export class HabboCommunicationManager extends Component implements IHabboCommunicationManager, IConnectionCallback
{
    private _messageConfig: IMessageConfiguration;
    private _config: IHabboConnectionConfig | null = null;
    private _portIndex: number = -1;
    private _connectionAttempt: number = 1;
    private _maxConnectionAttempts: number = 2;
    private _pendingMessageEvents: IMessageEvent[] = [];
    private _mode: number = 0;
    private _tcpNoDelay: boolean = true;
    private _suggestedLoginActions: unknown[] = [];
    private _messageQueue: string = '';

    constructor(context: IContext)
    {
        super(context);
        this._messageConfig = new HabboMessages();
    }

    private _sessionDataManager: SessionDataManager | null = null;

    get sessionDataManager(): ISessionDataManager | null
    {
        return this._sessionDataManager;
    }

    private _connection: IConnection | null = null;

    get connection(): IConnection | null
    {
        return this._connection;
    }

    private _ssoTicket: string | null = null;

    get ssoTicket(): string | null
    {
        return this._ssoTicket;
    }

    set ssoTicket(value: string | null)
    {
        this._ssoTicket = value;
    }

    get isConnected(): boolean
    {
        return this._connection?.connected ?? false;
    }

    get mode(): number
    {
        return 0;
    }

    set mode(value: number)
    {
        this._mode = value;
    }

    get port(): number
    {
        if(!this._config || this._portIndex < 0 || this._portIndex >= this._config.ports.length)
        {
            return 0;
        }

        return this._config.ports[this._portIndex];
    }

    get suggestedLoginActions(): unknown[]
    {
        return this._suggestedLoginActions;
    }

    set suggestedLoginActions(value: unknown[])
    {
        this._suggestedLoginActions = value;
    }

    set tcpNoDelay(value: boolean)
    {
        this._tcpNoDelay = value;
    }

    get messages(): IMessageConfiguration
    {
        return this._messageConfig;
    }

    protected override get dependencies(): Array<ComponentDependency<any>>
    {
        return [
            new ComponentDependency(
                IID_CoreCommunicationManager,
                (manager: ICoreCommunicationManager | null) =>
                {
                    this._communicationManager = manager;
                },
                true
            ),
        ];
    }

    private _communicationManager: ICoreCommunicationManager | null = null;

    private get communicationManager(): ICoreCommunicationManager
    {
        if(!this._communicationManager)
        {
            throw new Error('CommunicationManager not available');
        }

        return this._communicationManager;
    }

    private _connectionActions: IConnectionActions | null = null;

    private get connectionActions(): IConnectionActions
    {
        if(!this._connectionActions)
        {
            throw new Error('Connection actions not set. Call setConnectionActions() first.');
        }

        return this._connectionActions;
    }

    /**
	 * Set connection actions for state updates
	 * Called by Helium after module registration
	 */
    setConnectionActions(actions: IConnectionActions): void
    {
        this._connectionActions = actions;
    }

    configure(config: IHabboConnectionConfig): void
    {
        this._config = config;
        this._ssoTicket = config.ssoTicket || null;
    }

    initConnection(type: string): void
    {
        if(type !== 'habbo')
        {
            log.warn(`Unknown connection type: ${type}`);

            return;
        }

        if(!this._config)
        {
            throw new Error('Connection not configured. Call configure() first.');
        }

        this.createConnection();

        // Dispose previous SessionDataManager
        if(this._sessionDataManager)
        {
            this._sessionDataManager.dispose();
        }

        this._sessionDataManager = new SessionDataManager(this.context);

        this._portIndex = -1;
        this._connectionAttempt = 1;
        this.tryNextPort();
    }

    addMessageEvent(event: IMessageEvent): IMessageEvent
    {
        if(this._connection)
        {
            this._connection.addMessageEvent(event);
        }
        else
        {
            // Buffer events until connection is established
            this._pendingMessageEvents.push(event);
        }
        return event;
    }

    removeMessageEvent(event: IMessageEvent): void
    {
        if(this._connection)
        {
            this._connection.removeMessageEvent(event);
        }
        else
        {
            // Remove from pending events if not yet registered
            const index = this._pendingMessageEvents.indexOf(event);
            if(index !== -1)
            {
                this._pendingMessageEvents.splice(index, 1);
            }
        }
    }

    renewSocket(): void
    {
        this._connectionAttempt = 1;
        this._portIndex = -1;
        this._connection?.createSocket();
    }

    addHabboConnectionMessageEvent(event: IMessageEvent): IMessageEvent
    {
        return this.addMessageEvent(event);
    }

    removeHabboConnectionMessageEvent(event: IMessageEvent): void
    {
        this.removeMessageEvent(event);
    }

    createEncryption(): IEncryption
    {
        return new ArcFour();
    }

    initializeEncryption(): IEncryption
    {
        return this.createEncryption();
    }

    createKeyExchange(prime: string, generator: string): IKeyExchange
    {
        return new DiffieHellman(prime, generator);
    }

    initializeKeyExchange(prime: string, generator: string): IKeyExchange
    {
        return this.createKeyExchange(prime, generator);
    }

    disconnect(): void
    {
        this._connection?.close();
    }

    onMessage(listener: (event: IMessageEvent) => void): () => void
    {
        if(!this._connection)
        {
            // Buffer listener until connection is ready
            const bufferedListener = listener;
            const checkConnection = () =>
            {
                if(this._connection)
                {
                    this._connection.on('messageEvent', bufferedListener);
                }
            };
            // Check on next tick in case connection is created soon
            setTimeout(checkConnection, 0);
            return () =>
            {
                this._connection?.off('messageEvent', bufferedListener);
            };
        }

        this._connection.on('messageEvent', listener);
        return () =>
        {
            this._connection?.off('messageEvent', listener);
        };
    }

    private _webApiSession: HabboWebApiSession | null = null;
    private _host: string = '';
    private _ports: number[] = [];

    /**
	 * AS3: updateHostParameters()
	 * Reads connection.info.host and connection.info.port from configuration
	 * and updates the internal host/port list.
	 */
    updateHostParameters(): void
    {
        const configuration = this.context.configuration;

        if(!configuration)
        {
            return;
        }

        const host = configuration.getProperty('connection.info.host');

        if(!host)
        {
            log.error('connection.info.host not set');

            return;
        }

        const portStr = configuration.getProperty('connection.info.port');

        if(!portStr)
        {
            log.error('connection.info.port not set');

            return;
        }

        this._ports = portStr.split(',').map(p => parseInt(p.trim(), 10));
        this._host = host;
    }

    /**
	 * AS3: createHabboWebApiSession(listener, server)
	 * Creates a new HabboWebApiSession for HTTP API requests.
	 */
    createHabboWebApiSession(listener: IHabboWebApiListener, server: string): IHabboWebApiSession
    {
        if(this._webApiSession)
        {
            this.resetHabboWebApiSession();
        }

        const session = new HabboWebApiSession(server);

        session.addListener(listener);

        this._webApiSession = session;
        this.events.emit('HABBO_POCKET_SESSION_CREATED');

        return session;
    }

    /**
	 * AS3: getHabboWebApiSession()
	 * Returns the current HabboWebApiSession, or null if not created.
	 */
    getHabboWebApiSession(): IHabboWebApiSession | null
    {
        return this._webApiSession;
    }

    resetHabboWebApiSession(): void
    {
        if(!this._webApiSession)
        {
            return;
        }

        this._webApiSession.dispose();
        this._webApiSession = null;
    }

    // IConnectionCallback
    connectionInit(host: string, port: number): void
    {
        log.info(`Connecting to ${host}:${port}...`);

        this._connectionActions?.setConnecting();
    }

    connectionOpened(): void
    {
        log.success('Connected to server');

        this._connectionActions?.setConnected();
    }

    connectionClosed(): void
    {
        log.info('Connection closed');

        this._connectionActions?.setDisconnected();
    }

    connectionError(error: Error): void
    {
        log.error(`Connection error: ${error.message}`);
        // Only set error state if we've exhausted all retry attempts
        if(this._connectionAttempt >= this._maxConnectionAttempts &&
			this._portIndex >= (this._config?.ports.length ?? 0) - 1)
        {
            this._connectionActions?.setError(error.message);
            this.events.emit('connectionError', error);
        }
        this.tryNextPort();
    }

    messageReceived(messageId: string): void
    {
        ErrorReportStorage.setDebugData('rece_msg_time', String(Date.now()));
        this.appendMessageQueue('R', messageId);
    }

    messageSent(messageId: string): void
    {
        ErrorReportStorage.setDebugData('sent_msg_time', String(Date.now()));
        this.appendMessageQueue('S', messageId);
    }

    messageParseError(message: IMessageDataWrapper): void
    {
        ErrorReportStorage.setDebugData('sent_msg_data', String(message));
        this.setMessageQueueErrorDebugData();
    }

    setMessageQueueErrorDebugData(): void
    {
        ErrorReportStorage.setDebugData('MESSAGE_QUEUE', this._messageQueue);
    }

    protected override initComponent(): void
    {
        log.debug('HabboCommunicationManager initialized');

        this.createConnection();

        // Forward loginStep events
        this.events.on('loginStep', (step: HabboCommunicationEventType) =>
        {
            this._connectionActions?.setLoginStep(step);

            if(step === HabboCommunicationEvent.AUTHENTICATED)
            {
                this._connection?.isAuthenticated();
                this._connectionActions?.setAuthenticated();
                this.events.emit('authenticated');
            }
        });
    }

    private createConnection(): void
    {
        if(this._connection)
        {
            return;
        }

        this._connection = this.communicationManager.createConnection(this);
        this._connection.registerMessageClasses(this._messageConfig);
        this._connection.isConfigured();

        if(this._pendingMessageEvents.length > 0)
        {
            log.debug(`Flushing ${this._pendingMessageEvents.length} pending message events`);

            for(const event of this._pendingMessageEvents)
            {
                this._connection.addMessageEvent(event);
            }

            this._pendingMessageEvents = [];
        }
    }

    private tryNextPort(): void
    {
        if(!this._connection || !this._config) return;

        if(this._connection.connected) return;

        this._portIndex++;

        if(this._portIndex >= this._config.ports.length)
        {
            this._connectionAttempt++;

            if(this._connectionAttempt > this._maxConnectionAttempts)
            {
                log.failure('Failed to connect after all attempts');

                return;
            }

            this._portIndex = 0;
        }

        const port = this._config.ports[this._portIndex];

        this._connection.timeout = this._connectionAttempt * 10000;
        this._connection.init(this._config.host, port, this._tcpNoDelay);
    }

    private appendMessageQueue(direction: string, messageId: string): void
    {
        if(this._messageQueue.length > 0)
        {
            this._messageQueue += `,${direction}:${messageId}`;
        }
        else
        {
            this._messageQueue = `${direction}:${messageId}`;
        }

        if(this._messageQueue.length > 150)
        {
            this._messageQueue = this._messageQueue.substring(this._messageQueue.length - 150);
        }
    }
}

import {EventEmitter} from 'eventemitter3';
import {Component, ComponentDependency, type IContext} from '@core/runtime';
import {IID_RoomEngine} from '@iid/IIDRoomEngine';
import {IID_HabboFreeFlowChat} from '@iid/IIDHabboFreeFlowChat';
import {IID_AvatarRenderManager} from '@iid/IIDAvatarRenderManager';
import type {IHabboCommunicationManager} from '../communication/IHabboCommunicationManager';
import type {IHabboTracking} from '../tracking/IHabboTracking';
import type {IHabboFreeFlowChat} from '../freeflowchat/IHabboFreeFlowChat';
import type {IAvatarRenderManager} from '../avatar/IAvatarRenderManager';
import type {IRoomSessionManager} from './IRoomSessionManager';
import type {IRoomHandlerListener} from './IRoomHandlerListener';
import type {IRoomSession} from './IRoomSession';
import {RoomSessionState} from './IRoomSession';
import {RoomSession} from './RoomSession';
import {RoomSessionEvent} from './events/RoomSessionEvent';
import {
    RoomNetworkOpenConnectionMessageComposer
} from '../communication/messages/outgoing/room/session/RoomNetworkOpenConnectionMessageComposer';
import type {BaseHandler} from './handler/BaseHandler';
import {RoomSessionHandler, RoomSessionHandlerState} from './handler/RoomSessionHandler';
import {RoomPermissionsHandler} from './handler/RoomPermissionsHandler';
import {RoomDataHandler} from './handler/RoomDataHandler';
import {RoomChatHandler} from './handler/RoomChatHandler';
import {RoomUsersHandler} from './handler/RoomUsersHandler';
import {GenericErrorHandler} from './handler/GenericErrorHandler';
import {PollHandler} from './handler/PollHandler';
import {RoomDimmerPresetsHandler} from './handler/RoomDimmerPresetsHandler';
import {WordQuizHandler} from './handler/WordQuizHandler';
import {PresentHandler} from './handler/PresentHandler';
import {PetPackageHandler} from './handler/PetPackageHandler';
import {AvatarEffectsHandler} from './handler/AvatarEffectsHandler';
import {RoomEngineEvent} from '../room/events/RoomEngineEvent';
import {Logger} from '@core/utils/Logger';
import type {IRoomEngine} from '@habbo/room';
import {IID_HabboCommunicationManager} from "@iid/IIDHabboCommunicationManager";
import {IID_HabboTracking} from '@iid/IIDHabboTracking';

const log = Logger.getLogger('RoomSessionManager');

/**
 * Room session manager implementation
 *
 * Based on AS3: com.sulake.habbo.session.RoomSessionManager
 *
 * Implements both IRoomSessionManager and IRoomHandlerListener.
 * Creates handlers that listen to messages and call back via IRoomHandlerListener.
 *
 * Room entry flow:
 * 1. gotoRoom() creates RoomSession
 * 2. createSession() stores session, emits RSE_CREATED
 * 3. startSession() calls session.start() which sends OpenFlatConnectionMessageComposer
 * 4. Server responds with OpenConnectionMessageEvent -> onRoomConnected
 * 5. Server responds with RoomReadyMessageEvent -> onRoomReady -> sessionUpdate(RS_READY)
 */
export class RoomSessionManager extends Component implements IRoomSessionManager, IRoomHandlerListener
{
    private _communication: IHabboCommunicationManager | null = null;
    private _roomEngine: IRoomEngine | null = null;
    private _habboTracking: IHabboTracking | null = null;
    private _freeFlowChat: IHabboFreeFlowChat | null = null;
    private _avatarRenderer: IAvatarRenderManager | null = null;
    private _handlers: BaseHandler[] = [];
    private _sessions: Map<string, RoomSession> = new Map();
    private _pendingSession: RoomSession | null = null;

    constructor(context: IContext)
    {
        super(context);
    }

    private _sessionEvents: EventEmitter = new EventEmitter();

    get sessionEvents(): EventEmitter
    {
        return this._sessionEvents;
    }

    private _sessionStarting: boolean = false;

    get sessionStarting(): boolean
    {
        return this._sessionStarting;
    }

    private _initialized: boolean = false;

    /**
	 * Whether the manager is fully initialized
	 * In AS3 this also checks room engine initialization
	 */
    get initialized(): boolean
    {
        return this._initialized && this.allRequiredDependenciesInjected;
    }

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
                IID_HabboTracking,
                (tracking: IHabboTracking | null) =>
                {
                    this._habboTracking = tracking;
                },
                false
            ),
            new ComponentDependency(
                IID_HabboFreeFlowChat,
                (chat: IHabboFreeFlowChat | null) =>
                {
                    this._freeFlowChat = chat;
                },
                false
            ),
            new ComponentDependency(
                IID_RoomEngine,
                (engine: IRoomEngine | null) =>
                {
                    this._roomEngine = engine;
                },
                false, // Not required
                [
                    {
                        type: RoomEngineEvent.REE_ENGINE_INITIALIZED,
                        callback: this.onRoomEngineInitialized.bind(this),
                    },
                ]
            ),
            new ComponentDependency(
                IID_AvatarRenderManager,
                (renderer: IAvatarRenderManager | null) =>
                {
                    this._avatarRenderer = renderer;
                },
                false
            ),
        ];
    }

    /**
	 * Go to a room - creates and starts a new room session
	 */
    gotoRoom(roomId: number, password: string = '', roomResources: string = '', skipOpc: boolean = false): boolean
    {
        const session = new RoomSession();

        session.roomId = roomId;
        session.roomPassword = password;
        session.roomResources = roomResources;
        session.skipOpc = skipOpc;

        return this.createSession(session);
    }

    /**
	 * Go to a room via network (for room forwarding)
	 *
	 * @see sources/win63_version/habbo/session/RoomSessionManager.as gotoRoomNetwork()
	 */
    gotoRoomNetwork(roomId: number, homeRoomId: number): boolean
    {
        const session = new RoomSession();

        session.roomId = 1;
        session.roomPassword = '';
        session.openConnectionComposer = new RoomNetworkOpenConnectionMessageComposer(roomId, homeRoomId);

        return this.createSession(session);
    }

    /**
	 * Start an existing session
	 */
    startSession(session: IRoomSession): boolean
    {
        if(session.state === RoomSessionState.STARTED)
        {
            return false;
        }

        if((session as RoomSession).isGameSession)
        {
            return true;
        }

        if(session.start())
        {
            this._sessionStarting = false;
            this._sessionEvents.emit(RoomSessionEvent.RSE_STARTED, new RoomSessionEvent(RoomSessionEvent.RSE_STARTED, session));
            this.updateHandlers(session);

            log.info(`Room session started: ${session.roomId}`);

            return true;
        }

        this.disposeSession(session.roomId);

        this._sessionStarting = false;

        return false;
    }

    /**
	 * Get an active session by room ID
	 */
    getSession(roomId: number): IRoomSession | null
    {
        const key = this.getRoomIdentifier(roomId);

        return this._sessions.get(key) ?? null;
    }

    /**
	 * Dispose a session
	 */
    disposeSession(roomId: number, disposeEngine: boolean = true): void
    {
        const key = this.getRoomIdentifier(roomId);
        const session = this._sessions.get(key);

        if(session)
        {
            this._sessions.delete(key);
            this._sessionEvents.emit(RoomSessionEvent.RSE_ENDED, new RoomSessionEvent(RoomSessionEvent.RSE_ENDED, session), disposeEngine);

            session.dispose();

            // Dispose room engine content if requested
            if(disposeEngine && this._roomEngine)
            {
                this._roomEngine.disposeRoomInstance(roomId);
            }

            log.info(`Room session disposed: ${roomId}`);
        }
    }

    /**
	 * Start a game session
	 */
    startGameSession(): void
    {
        const session = new RoomSession();

        session.roomId = 1;
        session.isGameSession = true;

        if(this._communication?.connection)
        {
            session.connection = this._communication.connection;
        }

        if(this._habboTracking)
        {
            session.habboTracking = this._habboTracking;
        }

        const key = this.getRoomIdentifier(session.roomId);

        this._sessions.set(key, session);

        this._sessionEvents.emit(RoomSessionEvent.RSE_CREATED, new RoomSessionEvent(RoomSessionEvent.RSE_CREATED, session));

        log.info('Game session started');
    }

    /**
	 * Dispose the game session
	 */
    disposeGameSession(): void
    {
        const key = this.getRoomIdentifier(1);
        const session = this._sessions.get(key);

        if(session && session.isGameSession)
        {
            this.disposeSession(1, false);
        }
    }

    /**
	 * Called by handlers when session state changes
	 */
    sessionUpdate(roomId: number, type: string): void
    {
        const session = this.getSession(roomId);

        if(session !== null)
        {
            switch(type)
            {
                case RoomSessionHandlerState.RS_CONNECTED:
                case RoomSessionHandlerState.RS_READY:
                    // Session connected/ready - no action needed
                    break;
                case RoomSessionHandlerState.RS_DISCONNECTED:
                    this.disposeSession(roomId);
                    break;
            }
        }

        log.debug(`Session update: room=${roomId}, type=${type}`);
    }

    /**
	 * Called by handlers when session needs reinitialization
	 */
    sessionReinitialize(oldRoomId: number, newRoomId: number): void
    {
        const oldKey = this.getRoomIdentifier(oldRoomId);
        const session = this._sessions.get(oldKey);

        if(session)
        {
            this._sessions.delete(oldKey);

            session.reset(newRoomId);

            const newKey = this.getRoomIdentifier(newRoomId);

            // Remove any existing session at new key
            const existingSession = this._sessions.get(newKey);

            if(existingSession)
            {
                existingSession.dispose();
            }

            this._sessions.set(newKey, session);

            this.updateHandlers(session);
        }

        log.debug(`Session reinitialize: ${oldRoomId} -> ${newRoomId}`);
    }

    override dispose(): void
    {
        if(this.disposed) return;

        // Dispose all sessions
        for(const [key, session] of this._sessions)
        {
            session.dispose();

            this._sessions.delete(key);
        }

        // Dispose all handlers
        for(const handler of this._handlers)
        {
            handler.dispose();
        }

        this._handlers = [];

        this._sessionEvents.removeAllListeners();

        super.dispose();

        log.info('RoomSessionManager disposed');
    }

    protected override initComponent(): void
    {
        this.createHandlers();

        this._initialized = true;

        this.executePendingSessionRequest();

        log.info('RoomSessionManager initialized');
    }

    /**
	 * Called when room engine is initialized
	 */
    private onRoomEngineInitialized(..._args: unknown[]): void
    {
        log.debug('Room engine initialized');

        // Execute any pending session requests now that engine is ready
        this.executePendingSessionRequest();
    }

    private createHandlers(): void
    {
        if(!this._communication)
        {
            return;
        }

        const connection = this._communication.connection;

        // Create handlers in AS3 order
        // @see sources/win63_version/habbo/session/RoomSessionManager.as line 159-175
        this._handlers.push(new RoomSessionHandler(connection, this));
        this._handlers.push(new RoomChatHandler(connection, this));
        this._handlers.push(new RoomUsersHandler(connection, this));
        this._handlers.push(new RoomPermissionsHandler(connection, this));
        this._handlers.push(new AvatarEffectsHandler(connection, this));
        this._handlers.push(new RoomDataHandler(connection, this));
        this._handlers.push(new PresentHandler(connection, this));
        this._handlers.push(new GenericErrorHandler(connection, this));
        this._handlers.push(new PollHandler(connection, this));
        this._handlers.push(new WordQuizHandler(connection, this));
        this._handlers.push(new RoomDimmerPresetsHandler(connection, this));
        this._handlers.push(new PetPackageHandler(connection, this));

        log.debug(`Created ${this._handlers.length} handlers`);
    }

    private createSession(session: RoomSession): boolean
    {
        if(!this.initialized)
        {
            log.debug(`Not initialized, creating pending session for room: ${session.roomId}`);

            this._pendingSession = session;

            return false;
        }

        const key = this.getRoomIdentifier(session.roomId);

        this._sessionStarting = true;

        // Dispose existing session for this room
        if(this._sessions.has(key))
        {
            this.disposeSession(session.roomId, false);
        }

        // Set connection
        if(this._communication?.connection)
        {
            session.connection = this._communication.connection;
        }

        // Propagate tracking to session
        if(this._habboTracking)
        {
            session.habboTracking = this._habboTracking;
        }

        this._sessions.set(key, session);

        this._sessionEvents.emit(RoomSessionEvent.RSE_CREATED, new RoomSessionEvent(RoomSessionEvent.RSE_CREATED, session));

        log.info(`Room session created: ${session.roomId}`);

        // Start the session
        this.startSession(session);

        return true;
    }

    private executePendingSessionRequest(): void
    {
        if(this.initialized && this._pendingSession !== null)
        {
            this.createSession(this._pendingSession);

            this._pendingSession = null;
        }
    }

    private updateHandlers(session: IRoomSession): void
    {
        if(session !== null && this._handlers !== null)
        {
            for(const handler of this._handlers)
            {
                if(handler !== null)
                {
                    handler.roomId = session.roomId;
                }
            }
        }
    }

    private getRoomIdentifier(roomId: number): string
    {
        return `room_${roomId}`;
    }
}

import type {IRoomSession} from './IRoomSession';
import type {EventEmitter} from 'eventemitter3';

/**
 * Room session manager interface
 *
 * Based on AS3: com.sulake.habbo.session.IRoomSessionManager
 *
 * Manages room sessions lifecycle - creation, start, and disposal.
 */
export interface IRoomSessionManager
{
    /**
	 * Event emitter for session lifecycle events (RSE_CREATED, RSE_STARTED, RSE_ENDED).
	 *
	 * This is separate from Component.events (DI emitter) to avoid the
	 * EventEmitter override bug. Consumers must use sessionEvents, not events.
	 */
    readonly sessionEvents: EventEmitter;

    /**
	 * Whether a session is currently starting
	 */
    readonly sessionStarting: boolean;

    /**
	 * Go to a room - creates and starts a new room session
	 *
	 * @param roomId Room ID to enter
	 * @param password Room password (optional)
	 * @param roomResources Room resources (optional)
	 * @returns True if session was created
	 */
    gotoRoom(roomId: number, password?: string, roomResources?: string, skipOpc?: boolean): boolean;

    /**
	 * Go to a room via network (for room forwarding)
	 *
	 * @param roomId Room ID
	 * @param homeRoomId Home room ID
	 * @returns True if session was created
	 */
    gotoRoomNetwork(roomId: number, homeRoomId: number): boolean;

    /**
	 * Start an existing session
	 *
	 * @param session The room session to start
	 * @returns True if started successfully
	 */
    startSession(session: IRoomSession): boolean;

    /**
	 * Get an active session by room ID
	 *
	 * @param roomId Room ID
	 * @returns The session or null if not found
	 */
    getSession(roomId: number): IRoomSession | null;

    /**
	 * Dispose a session
	 *
	 * @param roomId Room ID
	 * @param disposeEngine Whether to also dispose room engine data
	 */
    disposeSession(roomId: number, disposeEngine?: boolean): void;

    /**
	 * Start a game session (for SnowWar etc.)
	 */
    startGameSession(): void;

    /**
	 * Dispose the game session
	 */
    disposeGameSession(): void;
}

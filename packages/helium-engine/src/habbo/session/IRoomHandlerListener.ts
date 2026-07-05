import type {EventEmitter} from 'eventemitter3';
import type {IRoomSession} from './IRoomSession';

/**
 * Room handler listener interface
 *
 * Based on AS3: com.sulake.habbo.session.IRoomHandlerListener
 *
 * This interface is implemented by RoomSessionManager and used by handlers
 * to communicate session state changes back to the manager.
 */
export interface IRoomHandlerListener
{
    /**
	 * Get the event emitter for dispatching session events
	 */
    readonly sessionEvents: EventEmitter;

    /**
	 * Called when a session state changes
	 * @param roomId The room ID
	 * @param type The update type (RS_CONNECTED, RS_READY, RS_DISCONNECTED)
	 */
    sessionUpdate(roomId: number, type: string): void;

    /**
	 * Called when a session needs to be reinitialized with a new room ID
	 * @param oldRoomId The old room ID
	 * @param newRoomId The new room ID
	 */
    sessionReinitialize(oldRoomId: number, newRoomId: number): void;

    /**
	 * Get a session by room ID
	 */
    getSession(roomId: number): IRoomSession | null;
}

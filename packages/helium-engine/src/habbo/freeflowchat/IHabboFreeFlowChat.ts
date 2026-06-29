import type {EventEmitter} from 'eventemitter3';
import type {ISessionDataManager} from '@habbo/session/ISessionDataManager';
import type {ChatItem} from './data/ChatItem';

/**
 * Minimal shape for the room session manager as needed by the FreeFlowChat handlers.
 * Includes sessionEvents (the correct EventEmitter for session lifecycle events)
 * rather than the Component-inherited events getter.
 *
 * @see IRoomSessionManager in @habbo/session/IRoomSessionManager
 * @see IRoomHandlerListener in @habbo/session/IRoomHandlerListener
 */
export interface IFreeFlowChatRoomSessionManager
{
	readonly sessionEvents: EventEmitter;
}

/**
 * Interface for the HabboFreeFlowChat component.
 *
 * Provides methods for chat management, room lifecycle, visibility control,
 * and user preference management for the free-flow chat system.
 *
 * @see source_as_win63/habbo/freeflowchat/class_1809.as
 */
export interface IHabboFreeFlowChat
{
	/**
	 * Whether free flow chat is disabled in user preferences
	 */
	isDisabledInPreferences: boolean;

	/**
	 * The user's preferred chat style ID
	 */
	preferedChatStyle: number;

	/**
	 * Reference to the room session manager (used by handlers).
	 * Uses IFreeFlowChatRoomSessionManager to access sessionEvents
	 * (the correct EventEmitter, not the Component.events getter).
	 */
	readonly roomSessionManager: IFreeFlowChatRoomSessionManager | null;

	/**
	 * Reference to the session data manager
	 */
	readonly sessionDataManager: ISessionDataManager | null;

	/**
	 * Clear the current chat flow stage
	 */
	clear(): void;

	/**
	 * Toggle the chat history visibility
	 */
	toggleVisibility(): void;

	/**
	 * Insert a chat item into the chat system.
	 * Adds to history buffer and (in VIEW layer) creates the visual bubble.
	 *
	 * @param item The chat item to insert
	 */
	insertChat(item: ChatItem): void;

	/**
	 * Called when a room session has been created/entered
	 */
	roomEntered(): void;

	/**
	 * Called when a room session has ended/left
	 */
	roomLeft(): void;
}

import type {RoomSessionEvent} from '@habbo/session/events/RoomSessionEvent';
import type {IHabboFreeFlowChat} from '../IHabboFreeFlowChat';

/**
 * Room session lifecycle handler. Listens to RSE_CREATED and RSE_ENDED events
 * on the roomSessionManager and calls the corresponding roomEntered() and
 * roomLeft() methods on the free flow chat component.
 *
 * @see source_as_win63/habbo/freeflowchat/data/RoomSessionEventHandler.as
 */
export class RoomSessionEventHandler
{
	private _freeFlowChat: IHabboFreeFlowChat | null;
	private _onRoomSessionCreatedBound: (event: RoomSessionEvent) => void;
	private _onRoomSessionEndedBound: (event: RoomSessionEvent) => void;

	constructor(freeFlowChat: IHabboFreeFlowChat)
	{
		this._freeFlowChat = freeFlowChat;

		this._onRoomSessionCreatedBound = this.onRoomSessionCreated.bind(this);
		this._onRoomSessionEndedBound = this.onRoomSessionEnded.bind(this);

		if (this._freeFlowChat.roomSessionManager)
		{
			this._freeFlowChat.roomSessionManager.sessionEvents.on(
				'RSE_CREATED',
				this._onRoomSessionCreatedBound
			);
			this._freeFlowChat.roomSessionManager.sessionEvents.on(
				'RSE_ENDED',
				this._onRoomSessionEndedBound
			);
		}
	}

	get disposed(): boolean
	{
		return this._freeFlowChat === null;
	}

	/**
	 * Dispose of the handler and remove event listeners.
	 */
	dispose(): void
	{
		if (this.disposed) return;

		if (this._freeFlowChat?.roomSessionManager)
		{
			this._freeFlowChat.roomSessionManager.sessionEvents.off(
				'RSE_CREATED',
				this._onRoomSessionCreatedBound
			);
			this._freeFlowChat.roomSessionManager.sessionEvents.off(
				'RSE_ENDED',
				this._onRoomSessionEndedBound
			);
		}

		this._freeFlowChat = null;
	}

	/**
	 * Handler for RSE_CREATED event. Notifies the free flow chat
	 * that a room has been entered.
	 */
	private onRoomSessionCreated(_event: RoomSessionEvent): void
	{
		if (this._freeFlowChat)
		{
			this._freeFlowChat.roomEntered();
		}
	}

	/**
	 * Handler for RSE_ENDED event. Notifies the free flow chat
	 * that a room has been left.
	 */
	private onRoomSessionEnded(_event: RoomSessionEvent): void
	{
		if (this._freeFlowChat)
		{
			this._freeFlowChat.roomLeft();
		}
	}
}

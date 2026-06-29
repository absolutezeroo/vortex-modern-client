import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Requests the chatlog for a specific room.
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/moderator/GetRoomChatlogMessageComposer.as
 */
export class GetRoomChatlogMessageComposer extends MessageComposer<ConstructorParameters<typeof GetRoomChatlogMessageComposer>>
{
	private _data: ConstructorParameters<typeof GetRoomChatlogMessageComposer>;

	constructor(roomId: number, unused: number)
	{
		super();
		this._data = [roomId, unused];
	}

	getMessageArray()
	{
		return this._data;
	}
}

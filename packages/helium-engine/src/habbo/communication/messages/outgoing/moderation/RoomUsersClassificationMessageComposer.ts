import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Requests user classification data for users in a room.
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/userclassification/RoomUsersClassificationMessageComposer.as
 */
export class RoomUsersClassificationMessageComposer extends MessageComposer<ConstructorParameters<typeof RoomUsersClassificationMessageComposer>>
{
	private _data: ConstructorParameters<typeof RoomUsersClassificationMessageComposer>;

	constructor(roomName: string)
	{
		super();
		this._data = [roomName];
	}

	getMessageArray()
	{
		return this._data;
	}
}

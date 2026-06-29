import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Check if user can create a room
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/navigator/CanCreateRoomMessageComposer.as
 */
export class CanCreateRoomMessageComposer extends MessageComposer<ConstructorParameters<typeof CanCreateRoomMessageComposer>>
{
	private _data: ConstructorParameters<typeof CanCreateRoomMessageComposer>;

	constructor()
	{
		super();

		this._data = [];
	}

	getMessageArray()
	{
		return this._data;
	}

}

import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Add a room to favourites
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/navigator/AddFavouriteRoomMessageComposer.as
 */
export class AddFavouriteRoomMessageComposer extends MessageComposer<ConstructorParameters<typeof AddFavouriteRoomMessageComposer>>
{
	private _data: ConstructorParameters<typeof AddFavouriteRoomMessageComposer>;

	constructor(roomId: number)
	{
		super();

		this._data = [roomId];
	}

	getMessageArray()
	{
		return this._data;
	}

}

import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Remove a room from favourites
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/navigator/DeleteFavouriteRoomMessageComposer.as
 */
export class DeleteFavouriteRoomMessageComposer extends MessageComposer<ConstructorParameters<typeof DeleteFavouriteRoomMessageComposer>>
{
	private _data: ConstructorParameters<typeof DeleteFavouriteRoomMessageComposer>;

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

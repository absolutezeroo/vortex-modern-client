import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Search my friends' rooms
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/navigator/MyFriendsRoomsSearchMessageComposer.as
 */
export class MyFriendsRoomsSearchMessageComposer extends MessageComposer<ConstructorParameters<typeof MyFriendsRoomsSearchMessageComposer>>
{
	private _data: ConstructorParameters<typeof MyFriendsRoomsSearchMessageComposer>;

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

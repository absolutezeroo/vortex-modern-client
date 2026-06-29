import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Search rooms where I have rights
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/navigator/MyRoomRightsSearchMessageComposer.as
 */
export class MyRoomRightsSearchMessageComposer extends MessageComposer<ConstructorParameters<typeof MyRoomRightsSearchMessageComposer>>
{
	private _data: ConstructorParameters<typeof MyRoomRightsSearchMessageComposer>;

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

import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Room ad event tab ad clicked
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/navigator/RoomAdEventTabAdClickedComposer.as
 */
export class RoomAdEventTabAdClickedComposer extends MessageComposer<ConstructorParameters<typeof RoomAdEventTabAdClickedComposer>>
{
	private _data: ConstructorParameters<typeof RoomAdEventTabAdClickedComposer>;

	constructor(roomId: number, adName: string, adId: number)
	{
		super();

		this._data = [roomId, adName, adId];
	}

	getMessageArray()
	{
		return this._data;
	}

}

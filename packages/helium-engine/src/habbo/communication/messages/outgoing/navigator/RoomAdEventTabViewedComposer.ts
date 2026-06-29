import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Room ad event tab viewed
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/navigator/RoomAdEventTabViewedComposer.as
 */
export class RoomAdEventTabViewedComposer extends MessageComposer<ConstructorParameters<typeof RoomAdEventTabViewedComposer>>
{
	private _data: ConstructorParameters<typeof RoomAdEventTabViewedComposer>;

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

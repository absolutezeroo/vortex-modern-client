import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Search rooms by text
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/navigator/RoomTextSearchMessageComposer.as
 */
export class RoomTextSearchMessageComposer extends MessageComposer<ConstructorParameters<typeof RoomTextSearchMessageComposer>>
{
	private _data: ConstructorParameters<typeof RoomTextSearchMessageComposer>;

	constructor(searchText: string)
	{
		super();

		this._data = [searchText];
	}

	getMessageArray()
	{
		return this._data;
	}

}

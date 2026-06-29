import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Search popular rooms
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/navigator/PopularRoomsSearchMessageComposer.as
 */
export class PopularRoomsSearchMessageComposer extends MessageComposer<ConstructorParameters<typeof PopularRoomsSearchMessageComposer>>
{
	private _data: ConstructorParameters<typeof PopularRoomsSearchMessageComposer>;

	constructor(category: string, index: number)
	{
		super();

		this._data = [category, index];
	}

	getMessageArray()
	{
		return this._data;
	}

}

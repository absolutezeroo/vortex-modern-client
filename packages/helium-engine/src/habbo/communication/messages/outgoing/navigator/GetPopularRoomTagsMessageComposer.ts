import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Get popular room tags
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/navigator/GetPopularRoomTagsMessageComposer.as
 */
export class GetPopularRoomTagsMessageComposer extends MessageComposer<ConstructorParameters<typeof GetPopularRoomTagsMessageComposer>>
{
	private _data: ConstructorParameters<typeof GetPopularRoomTagsMessageComposer>;

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

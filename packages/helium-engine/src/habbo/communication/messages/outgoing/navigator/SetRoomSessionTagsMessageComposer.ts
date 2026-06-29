import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Set room session tags
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/navigator/SetRoomSessionTagsMessageComposer.as
 */
export class SetRoomSessionTagsMessageComposer extends MessageComposer<ConstructorParameters<typeof SetRoomSessionTagsMessageComposer>>
{
	private _data: ConstructorParameters<typeof SetRoomSessionTagsMessageComposer>;

	constructor(tag1: string, tag2: string)
	{
		super();

		this._data = [tag1, tag2];
	}

	getMessageArray()
	{
		return this._data;
	}

}

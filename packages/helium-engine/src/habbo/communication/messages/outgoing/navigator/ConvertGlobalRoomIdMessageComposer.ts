import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Convert global room ID
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/navigator/ConvertGlobalRoomIdMessageComposer.as
 */
export class ConvertGlobalRoomIdMessageComposer extends MessageComposer<ConstructorParameters<typeof ConvertGlobalRoomIdMessageComposer>>
{
	private _data: ConstructorParameters<typeof ConvertGlobalRoomIdMessageComposer>;

	constructor(flatId: string)
	{
		super();

		this._data = [flatId];
	}

	getMessageArray()
	{
		return this._data;
	}

}

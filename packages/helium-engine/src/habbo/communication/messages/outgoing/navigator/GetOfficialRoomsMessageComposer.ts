import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Get official rooms list
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/navigator/GetOfficialRoomsMessageComposer.as
 */
export class GetOfficialRoomsMessageComposer extends MessageComposer<ConstructorParameters<typeof GetOfficialRoomsMessageComposer>>
{
	private _data: ConstructorParameters<typeof GetOfficialRoomsMessageComposer>;

	constructor(index: number = 0)
	{
		super();

		this._data = [index];
	}

	getMessageArray()
	{
		return this._data;
	}

}

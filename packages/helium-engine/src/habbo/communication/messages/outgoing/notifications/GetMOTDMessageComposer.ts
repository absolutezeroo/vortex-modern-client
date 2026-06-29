import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Requests the Message of the Day from the server
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/notifications/GetMOTDMessageComposer.as
 */
export class GetMOTDMessageComposer extends MessageComposer<[]>
{
	private _data: [] = [];

	constructor()
	{
		super();
		this._data = [];
	}

	getMessageArray(): []
	{
		return this._data;
	}
}

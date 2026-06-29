import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Request user info after authentication
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/handshake/InfoRetrieveMessageComposer.as
 */
export class InfoRetrieveMessageComposer extends MessageComposer<ConstructorParameters<typeof InfoRetrieveMessageComposer>>
{
	private _data: ConstructorParameters<typeof InfoRetrieveMessageComposer>;

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

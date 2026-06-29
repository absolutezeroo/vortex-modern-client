import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Request to disconnect from server
 * Message ID: 1113
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/handshake/DisconnectMessageComposer.as
 */
export class DisconnectMessageComposer extends MessageComposer<ConstructorParameters<typeof DisconnectMessageComposer>>
{
	private _data: ConstructorParameters<typeof DisconnectMessageComposer>;

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

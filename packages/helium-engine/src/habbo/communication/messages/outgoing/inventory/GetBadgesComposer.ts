import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Request badges from server
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/inventory/badges/GetBadgesComposer.as
 */
export class GetBadgesComposer extends MessageComposer<ConstructorParameters<typeof GetBadgesComposer>>
{
	private _data: ConstructorParameters<typeof GetBadgesComposer>;

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

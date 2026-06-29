import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Request furniture inventory from server
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/inventory/furni/RequestFurniInventoryComposer.as
 */
export class RequestFurniInventoryComposer extends MessageComposer<ConstructorParameters<typeof RequestFurniInventoryComposer>>
{
	private _data: ConstructorParameters<typeof RequestFurniInventoryComposer>;

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

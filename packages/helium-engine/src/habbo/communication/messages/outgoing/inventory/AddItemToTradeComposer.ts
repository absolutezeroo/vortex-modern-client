import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Add item to trade
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/inventory/trading/AddItemToTradeComposer.as
 */
export class AddItemToTradeComposer extends MessageComposer<ConstructorParameters<typeof AddItemToTradeComposer>>
{
	private _data: ConstructorParameters<typeof AddItemToTradeComposer>;

	constructor(itemId: number)
	{
		super();

		this._data = [itemId];
	}

	getMessageArray()
	{
		return this._data;
	}

}

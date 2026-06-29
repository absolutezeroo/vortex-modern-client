import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Remove item from trade
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/inventory/trading/RemoveItemFromTradeComposer.as
 */
export class RemoveItemFromTradeComposer extends MessageComposer<ConstructorParameters<typeof RemoveItemFromTradeComposer>>
{
	private _data: ConstructorParameters<typeof RemoveItemFromTradeComposer>;

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

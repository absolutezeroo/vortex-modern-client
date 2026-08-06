import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Add several items to the open trade at once. `TradingModel.requestAddItemsToTrading()` sends
 * this only when more than one item survives the per-item check — a single survivor goes out
 * through `AddItemToTradeComposer` (2177) instead, which is a different message.
 *
 * The length prefix counts items and is written by the composer itself, not by the caller.
 *
 * AS3: sources/win63_version/habbo/communication/messages/outgoing/inventory/trading/AddItemsToTradeComposer.as
 * (`_SafeCls_3302` in the primary tree; header 3370 from its registry, corroborated by the
 * emulator as `AddItemsToTradeEvent`)
 */
export class AddItemsToTradeComposer extends MessageComposer<number[]>
{
    private _data: number[];

    constructor(itemIds: number[])
    {
        super();

        this._data = [itemIds.length, ...itemIds];
    }

    getMessageArray()
    {
        return this._data;
    }
}

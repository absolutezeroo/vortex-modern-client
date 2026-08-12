import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Adds items to, or takes them out of, the player's side of a wired trade (WIN63 header 3111).
 *
 * One composer for both directions: the leading boolean is what distinguishes them. The model
 * sends `false` with the whole selection when adding and `true` with a single id when removing,
 * which is why the ids stay a list either way.
 *
 * Name DERIVED: obfuscated in AS3 (`_SafeCls_3043`), named for the pair of model methods that
 * build it — `WiredTradingModel.requestAddItemsToTrading()` / `requestRemoveItemFromTrading()`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3044/_SafeCls_3043.as
 */
export class WiredTradeUpdateItemsComposer extends MessageComposer<Array<boolean | number>>
{
    // AS3: _SafeCls_3043.as::_SafeStr_4642 (the composer payload array)
    private _data: Array<boolean | number>;

    // AS3: _SafeCls_3043.as::_SafeCls_3043()
    constructor(remove: boolean, itemIds: number[])
    {
        super();

        this._data = [remove, itemIds.length, ...itemIds];
    }

    // AS3: _SafeCls_3043.as::getMessageArray()
    getMessageArray(): Array<boolean | number>
    {
        return this._data;
    }
}

import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Offers one or more owned collectibles into the open trade (WIN63 header 2481): a count, then
 * that many asset ids.
 *
 * AS3 narrows each id from Number to int on the way in (`_loc3_.push(int(_loc2_))`) — asset ids
 * travel as longs everywhere else in the collectibles path, and this is the one place they are
 * cut to 32 bits. The port keeps the narrowing rather than the wider type, because the wire
 * format is what it is.
 *
 * Name DERIVED: obfuscated in AS3 (`_SafeCls_2741`), named for
 * `TradingModel.requestAddNftsToTrading()`, its only sender.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2742/_SafeCls_2741.as
 */
export class AddNftToTradeComposer extends MessageComposer<number[]>
{
    // AS3: _SafeCls_2741.as::_SafeStr_4642
    private _data: number[];

    // AS3: _SafeCls_2741.as::_SafeCls_2741()
    constructor(assetIds: number[])
    {
        super();

        this._data = [assetIds.length];

        for(const assetId of assetIds) this._data.push(assetId | 0);
    }

    // AS3: _SafeCls_2741.as::getMessageArray()
    getMessageArray(): number[]
    {
        return this._data;
    }
}

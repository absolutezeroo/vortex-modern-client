import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Takes one collectible back out of the open trade (WIN63 header 521): a single asset id.
 *
 * Note the asymmetry with `AddNftToTradeComposer`, which sends a count and then a list — removal
 * is one asset at a time, and `TradingModel.requestRemoveItemFromTrading()` enforces it by only
 * sending when `pop(1)` returned exactly one id.
 *
 * Name DERIVED: obfuscated in AS3 (`_SafeCls_3173`), named for
 * `TradingModel.requestRemoveItemFromTrading()`, its only sender. `vortex-emulator` carries a
 * placeholder 9014 for this message with a note saying no such composer exists; the WIN63
 * registry says otherwise (`_composers[521] = _SafeCls_3173`), and the registry is authoritative.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2742/_SafeCls_3173.as
 */
export class RemoveNftFromTradeComposer extends MessageComposer<number[]>
{
    // AS3: _SafeCls_3173.as::_SafeStr_8791
    private _assetId: number;

    // AS3: _SafeCls_3173.as::_SafeCls_3173()
    constructor(assetId: number)
    {
        super();

        this._assetId = assetId;
    }

    // AS3: _SafeCls_3173.as::getMessageArray()
    getMessageArray(): number[]
    {
        return [this._assetId];
    }
}

import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Asks the server for this player's next targeted offer (header 848). Payload-free.
 *
 * Sent once from `OfferController.productDataReady()` — the offer references product codes, so
 * asking before the product data has loaded would give the views nothing to name.
 *
 * **Header disagreement, and this side is the authority.** WIN63's own registry has
 * `_composers[848]`; `vortex-emulator` currently listens on `9004`, a placeholder its own comment
 * admits to ("Real value for GetNextTargetedOfferEvent still unresolved"). Until the emulator is
 * corrected, this request lands nowhere and no targeted offer will ever arrive. Changing 848 here
 * to match the placeholder would be the wrong repair: the registry is what the real client sends.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1749/_SafeCls_2561.as
 * (composer class itself is obfuscated; identified by `OfferController.as::productDataReady()`,
 * its only sender, and by `_composers[848]` in the registry
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/_SafeCls_2046.as.)
 */
export class GetNextTargetedOfferComposer extends MessageComposer<[]>
{
    // AS3: .../src/unknowns/_SafePkg_1749/_SafeCls_2561.as::_SafeStr_4556
    private _data: [] = [];

    // AS3: .../src/unknowns/_SafePkg_1749/_SafeCls_2561.as::getMessageArray()
    getMessageArray(): []
    {
        return this._data;
    }
}

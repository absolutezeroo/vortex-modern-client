import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Buys `amount` of a targeted offer (header 2497).
 *
 * A targeted offer is not a catalog offer and does not go through `purchaseProduct()` — it has no
 * page and no offer id in the catalog's sense, only its own id.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1749/_SafeCls_2498.as
 * (composer class itself is obfuscated; identified by `OfferController.as::
 * purchaseTargetedOffer()`, its only sender, and by `_composers[2497]` in the registry
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/_SafeCls_2046.as.
 * `vortex-emulator` corroborates: `Revision20260701/Headers.cs::PurchaseTargetedOfferEvent = 2497`.)
 */
export class PurchaseTargetedOfferComposer extends MessageComposer<[number, number]>
{
    // AS3: .../src/unknowns/_SafePkg_1749/_SafeCls_2498.as::_SafeStr_4556
    private _data: [number, number];

    // AS3: .../src/unknowns/_SafePkg_1749/_SafeCls_2498.as::_SafeCls_2498()
    constructor(offerId: number, amount: number)
    {
        super();

        this._data = [offerId, amount];
    }

    // AS3: .../src/unknowns/_SafePkg_1749/_SafeCls_2498.as::getMessageArray()
    getMessageArray(): [number, number]
    {
        return this._data;
    }
}

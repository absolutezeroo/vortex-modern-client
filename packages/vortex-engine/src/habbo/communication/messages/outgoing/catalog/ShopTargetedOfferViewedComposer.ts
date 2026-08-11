import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * The same state report as `SetTargetedOfferStateComposer`, but for a Habbo Mall offer (header
 * 3046) — those arrive through the page's ExternalInterface bridge rather than over the wire, and
 * the server tracks them separately.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1749/_SafeCls_3817.as
 * (composer class itself is obfuscated; identified by `OfferController.as::maximizeMallOffer()` /
 * `onHabboMallOfferOpened()` / `onHabboMallOfferClosed()`, its only senders, and by
 * `_composers[3046]` in the registry
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/_SafeCls_2046.as.
 * `vortex-emulator` corroborates: `Revision20260701/Headers.cs::ShopTargetedOfferViewedEvent = 3046`.)
 */
export class ShopTargetedOfferViewedComposer extends MessageComposer<[number, number]>
{
    // AS3: .../src/unknowns/_SafePkg_1749/_SafeCls_3817.as::_SafeStr_4556
    private _data: [number, number];

    // AS3: .../src/unknowns/_SafePkg_1749/_SafeCls_3817.as::_SafeCls_3817()
    constructor(targetedOfferId: number, state: number)
    {
        super();

        this._data = [targetedOfferId, state];
    }

    // AS3: .../src/unknowns/_SafePkg_1749/_SafeCls_3817.as::getMessageArray()
    getMessageArray(): [number, number]
    {
        return this._data;
    }
}

import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Reports what the player did with a targeted offer (header 2874) — state 1 when the dialog opens,
 * state 4 when it is minimised away.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1749/_SafeCls_3795.as
 * (composer class itself is obfuscated; identified by `OfferController.as::maximizeOffer()` /
 * `minimizeOffer()`, its only senders, and by `_composers[2874]` in the registry
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/_SafeCls_2046.as.
 * `vortex-emulator` corroborates: `Revision20260701/Headers.cs::SetTargetedOfferStateEvent = 2874`.)
 */
export class SetTargetedOfferStateComposer extends MessageComposer<[number, number]>
{
    // AS3: .../src/unknowns/_SafePkg_1749/_SafeCls_3795.as::_SafeStr_4556
    private _data: [number, number];

    // AS3: .../src/unknowns/_SafePkg_1749/_SafeCls_3795.as::_SafeCls_3795()
    constructor(offerId: number, state: number)
    {
        super();

        this._data = [offerId, state];
    }

    // AS3: .../src/unknowns/_SafePkg_1749/_SafeCls_3795.as::getMessageArray()
    getMessageArray(): [number, number]
    {
        return this._data;
    }
}

import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Gives up a rented space.
 *
 * Sent by the handler's `cancelRent()`. The widget shows that button only to the furniture's
 * owner or to staff with security level 5.
 *
 * Header 61, from WIN63's registry (`_composers[61] = _SafeCls_3858`); the emulator corroborates it
 * as `RentableSpaceCancelRentMessageEvent`. The class name is recovered from
 * `sources/win63_version/habbo/communication/messages/outgoing/room/furniture/RentableSpaceCancelRentMessageComposer.as`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2609/_SafeCls_3858.as
 */
export class RentableSpaceCancelRentMessageComposer extends MessageComposer<[number]>
{
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2609/_SafeCls_3858.as::_SafeStr_4642
    private _data: [number];

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2609/_SafeCls_3858.as::_SafeCls_3858()
    constructor(objectId: number)
    {
        super();

        this._data = [objectId];
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2609/_SafeCls_3858.as::getMessageArray()
    getMessageArray(): [number]
    {
        return this._data;
    }
}

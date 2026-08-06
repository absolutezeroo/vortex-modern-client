import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Rents the space.
 *
 * Sent by the handler's `rentSpace()` from the widget's Rent button, which the widget only
 * enables once the price is affordable and the server said renting is allowed.
 *
 * Header 3165, from WIN63's registry (`_composers[3165] = _SafeCls_3261`); the emulator corroborates it
 * as `RentableSpaceRentMessageEvent`. The class name is recovered from
 * `sources/win63_version/habbo/communication/messages/outgoing/room/furniture/RentableSpaceRentMessageComposer.as`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2609/_SafeCls_3261.as
 */
export class RentableSpaceRentMessageComposer extends MessageComposer<[number]>
{
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2609/_SafeCls_3261.as::_SafeStr_4642
    private _data: [number];

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2609/_SafeCls_3261.as::_SafeCls_3261()
    constructor(objectId: number)
    {
        super();

        this._data = [objectId];
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2609/_SafeCls_3261.as::getMessageArray()
    getMessageArray(): [number]
    {
        return this._data;
    }
}

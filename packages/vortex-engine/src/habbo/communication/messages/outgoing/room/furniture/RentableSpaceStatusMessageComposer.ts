import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Asks for a rentable space's current state — who rents it, for how long, and at what price.
 *
 * Sent by the widget handler's `getRentableSpaceStatus()`, both when the furniture is opened and
 * after every successful rent or cancel.
 *
 * Header 2626, from WIN63's registry (`_composers[2626] = _SafeCls_2985`); the emulator corroborates it
 * as `RentableSpaceStatusMessageEvent`. The class name is recovered from
 * `sources/win63_version/habbo/communication/messages/outgoing/room/furniture/RentableSpaceStatusMessageComposer.as`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2609/_SafeCls_2985.as
 */
export class RentableSpaceStatusMessageComposer extends MessageComposer<[number]>
{
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2609/_SafeCls_2985.as::_SafeStr_4642
    private _data: [number];

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2609/_SafeCls_2985.as::_SafeCls_2985()
    constructor(objectId: number)
    {
        super();

        this._data = [objectId];
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2609/_SafeCls_2985.as::getMessageArray()
    getMessageArray(): [number]
    {
        return this._data;
    }
}

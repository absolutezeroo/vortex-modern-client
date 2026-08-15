import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Ask for the furniture inventory **from outside a room** — header 3862 in WIN63's registry
 * (`_SafeCls_2046.as::_composers[3862]`). Empty payload, like its in-room sibling.
 *
 * `FurniModel.requestInitialization()` picks between the two on `_isInRoom`. The server answers both
 * with a furni list; the distinction exists because the in-room variant can also prime the room's
 * placement state, which is meaningless in the hotel view.
 *
 * Name RECOVERED from
 * sources/win63_version/habbo/communication/messages/outgoing/inventory/furni/RequestFurniInventoryWhenNotInRoomComposer.as
 * — that tree is obfuscated too, but it is the one where messages keep readable filenames.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2324/_SafeCls_3731.as
 */
export class RequestFurniInventoryWhenNotInRoomComposer extends MessageComposer<[]>
{
    // AS3: _SafeCls_3731.as::_data (name derived: the field is _SafeStr_4642 in every tree)
    private _data: [] = [];

    // AS3: _SafeCls_3731.as::_SafeCls_3731()
    constructor()
    {
        super();
    }

    // AS3: _SafeCls_3731.as::getMessageArray()
    getMessageArray(): []
    {
        return this._data;
    }
}

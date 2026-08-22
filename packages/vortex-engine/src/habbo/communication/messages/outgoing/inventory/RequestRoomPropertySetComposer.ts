import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Apply a wallpaper/floor/landscape item to the room the player is standing in — header 2292 in
 * WIN63's registry (`_SafeCls_2046.as::_composers[2292]`).
 *
 * The three decoration categories (2 wallpaper, 3 floor, 4 landscape) are the only inventory items
 * that are never *placed*: there is no ghost and no tile to drop them on, so both senders route
 * them here instead of to the object mover. `FurniModel.requestSelectedFurniPlacement()` sends it
 * for a double-clicked inventory item; `HabboCatalog` sends it after a purchase, and only when the
 * bought decoration differs from the one the room already wears.
 *
 * The single field is the **inventory item id**, not a room id — the server resolves the room from
 * the session. `vortex-emulator`'s `RequestRoomPropertySetMessage` names it `RoomId` and feeds it
 * to `GetRoomCore()`, which cannot be right for either sender; the client side is what this trace
 * settles, and the server half is still to be corrected there.
 *
 * Name RECOVERED from
 * sources/win63_version/habbo/communication/messages/outgoing/inventory/furni/RequestRoomPropertySet.as
 * — that tree is obfuscated too, but it is the one where messages keep readable filenames.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2324/_SafeCls_2323.as
 */
export class RequestRoomPropertySetComposer extends MessageComposer<[number]>
{
    // AS3: _SafeCls_2323.as::_SafeStr_8814 (`var_4899` in win63_version — obfuscated in both)
    private _data: [number];

    // AS3: _SafeCls_2323.as::_SafeCls_2323()
    constructor(itemId: number)
    {
        super();

        this._data = [itemId];
    }

    // AS3: _SafeCls_2323.as::getMessageArray()
    getMessageArray(): [number]
    {
        return this._data;
    }
}

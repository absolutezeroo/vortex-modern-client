import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Confirms extend-or-buyout for an item held in the inventory strip (header 1029).
 *
 * Sibling of `ExtendRentOrBuyoutFurniMessageComposer`, which does the same for a furni standing in
 * a room; the two differ only in how the item is addressed — a strip id here, a room object there.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2609/_SafeCls_3492.as
 * (obfuscated in the primary dump; `_composers[1029] = _SafeCls_3492` in the registry
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/_SafeCls_2046.as)
 */
export class ExtendRentOrBuyoutStripItemMessageComposer extends MessageComposer<[number, boolean]>
{
    // AS3: _SafeCls_3492.as::_SafeStr_4556
    private _data: [number, boolean];

    // AS3: _SafeCls_3492.as::ExtendRentOrBuyoutStripItemMessageComposer()
    constructor(stripId: number, buyout: boolean)
    {
        super();
        this._data = [stripId, buyout];
    }

    // AS3: _SafeCls_3492.as::getMessageArray()
    getMessageArray(): [number, boolean]
    {
        return this._data;
    }
}

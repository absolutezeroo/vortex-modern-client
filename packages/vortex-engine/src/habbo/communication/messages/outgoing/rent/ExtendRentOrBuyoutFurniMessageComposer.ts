import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Confirms extend-or-buyout for a furni standing in a room (header 1427), reached from the
 * infostand rather than the inventory.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2609/_SafeCls_3533.as
 * (obfuscated in the primary dump; `_composers[1427] = _SafeCls_3533` in the registry
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/_SafeCls_2046.as)
 */
export class ExtendRentOrBuyoutFurniMessageComposer extends MessageComposer<[boolean, number, boolean]>
{
    // AS3: _SafeCls_3533.as::_SafeStr_4556
    private _data: [boolean, number, boolean];

    // AS3: _SafeCls_3533.as::ExtendRentOrBuyoutFurniMessageComposer()
    constructor(isWallItem: boolean, objectId: number, buyout: boolean)
    {
        super();
        this._data = [isWallItem, objectId, buyout];
    }

    // AS3: _SafeCls_3533.as::getMessageArray()
    getMessageArray(): [boolean, number, boolean]
    {
        return this._data;
    }
}

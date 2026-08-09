import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Asks the server what extending or buying out a rented furni would cost (header 1583).
 *
 * The item is identified by its *type name*, not an id, because the question is about the furni
 * type rather than the copy you own — the reply comes back keyed on the same name.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2609/_SafeCls_2608.as
 * (obfuscated in the primary dump; `_composers[1583] = _SafeCls_2608` in the registry
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/_SafeCls_2046.as)
 */
export class GetRentOrBuyoutOfferMessageComposer extends MessageComposer<[boolean, string, boolean]>
{
    // AS3: _SafeCls_2608.as::_SafeStr_4556
    private _data: [boolean, string, boolean];

    // AS3: _SafeCls_2608.as::GetRentOrBuyoutOfferMessageComposer()
    constructor(isWallItem: boolean, furniTypeName: string, buyout: boolean)
    {
        super();
        this._data = [isWallItem, furniTypeName, buyout];
    }

    // AS3: _SafeCls_2608.as::getMessageArray()
    getMessageArray(): [boolean, string, boolean]
    {
        return this._data;
    }
}

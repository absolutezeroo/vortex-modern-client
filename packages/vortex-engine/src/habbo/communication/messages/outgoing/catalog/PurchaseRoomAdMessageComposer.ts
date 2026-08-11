import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Buys (or extends) a room ad — the room-ad catalog page's replacement for the ordinary
 * `PurchaseFromCatalogComposer` (header 2928).
 *
 * `HabboCatalog.purchaseProduct()` picks between the two: this one is sent only while a
 * `RoomAdPurchaseData` exists whose `offerId` matches the offer being bought, which is exactly the
 * state `RoomAdsCatalogWidget` puts the catalog in.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1749/_SafeCls_2124.as
 * (composer class itself is obfuscated; identified as this message by
 * `HabboCatalog.as::purchaseProduct()`, its only sender, and by `_composers[2928]` in the registry
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/_SafeCls_2046.as.
 * `vortex-emulator` corroborates both the header and the field order:
 * `Revision20260701/Parsers/Catalog/PurchaseRoomAdMessageParser.cs`.)
 */
export class PurchaseRoomAdMessageComposer extends MessageComposer<[number, number, number, string, boolean, string, number]>
{
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1749/_SafeCls_2124.as::_SafeStr_4556
    private _data: [number, number, number, string, boolean, string, number];

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1749/_SafeCls_2124.as::_SafeCls_2124()
    constructor(pageId: number, offerId: number, flatId: number, name: string, extended: boolean, description: string, categoryId: number)
    {
        super();

        this._data = [pageId, offerId, flatId, name, extended, description, categoryId];
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1749/_SafeCls_2124.as::getMessageArray()
    getMessageArray(): [number, number, number, string, boolean, string, number]
    {
        return this._data;
    }
}

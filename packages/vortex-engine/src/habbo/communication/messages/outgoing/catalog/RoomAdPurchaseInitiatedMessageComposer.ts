import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Tells the server the player has reached the room-ad purchase widget (header 3607).
 *
 * Payload-free, and the server does nothing with it — `vortex-emulator`'s
 * `RoomAdPurchaseInitiatedMessageHandler` is an intentional no-op. It is an analytics ping, sent
 * once from `PurchaseCatalogWidget.init()` when the page's purchase widget carries the
 * `ROOM_INITIATE_PURCHASE` tag.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1749/_SafeCls_1846.as
 * (composer class itself is obfuscated; identified by `HabboCatalog.as::
 * sendRoomAdPurchaseInitiatedEvent()`, its only sender, and by `_composers[3607]` in the registry
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/_SafeCls_2046.as.)
 */
export class RoomAdPurchaseInitiatedMessageComposer extends MessageComposer<[]>
{
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1749/_SafeCls_1846.as::getMessageArray()
    private _data: [] = [];

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1749/_SafeCls_1846.as::getMessageArray()
    getMessageArray(): []
    {
        return this._data;
    }
}

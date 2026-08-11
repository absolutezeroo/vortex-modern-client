import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {RoomAdPurchaseInfoMessageParser} from '../../parser/catalog/RoomAdPurchaseInfoMessageParser';

/**
 * The server's answer to `GetRoomAdsPurchaseInfoMessageComposer` — which of the player's rooms a
 * room ad may point at, plus their club status (header 3787).
 *
 * Subscribed by `RoomAdsCatalogWidget`, which is the only consumer: the room-ad catalog page needs
 * the room list to fill its drop-menu before the player can buy anything.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1716/_SafeCls_2920.as
 * (obfuscated; `_SafeStr_4546[3787] = _SafeCls_2920` in the registry
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/_SafeCls_2046.as, and
 * `RoomAdsCatalogWidget.as::onPurchaseInfoEvent()` is its only handler. `vortex-emulator`
 * corroborates: `Revision20260701/Headers.cs::RoomAdPurchaseInfoComposer = 3787`.)
 */
export class RoomAdPurchaseInfoMessageEvent extends MessageEvent implements IMessageEvent
{
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1716/_SafeCls_2920.as::_SafeCls_2920()
    constructor(callback: MessageEventCallback)
    {
        super(callback, RoomAdPurchaseInfoMessageParser);
    }
}

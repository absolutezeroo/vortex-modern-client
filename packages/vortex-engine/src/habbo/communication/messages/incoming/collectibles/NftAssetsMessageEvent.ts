import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {NftAssetsMessageParser} from '../../parser/collectibles/NftAssetsMessageParser';

/**
 * The player's whole NFT asset inventory (header 2247).
 *
 * `_SafeStr_4546[2247] = _SafeCls_3840` in the registry
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/_SafeCls_2046.as, and
 * `habbo/inventory/_SafeCls_1951.as:166` is its only subscriber (`onCollectibles`).
 *
 * Header 2247 was previously documented in HabboMessages.ts as "an unrelated, unported message"
 * while RoomAdError was moved off it; that note is what identified this event, and it is now the
 * thing that ports it.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2442/_SafeCls_3840.as
 */
export class NftAssetsMessageEvent extends MessageEvent implements IMessageEvent
{
    // AS3: _SafeCls_3840.as::_SafeCls_3840()
    constructor(callback: MessageEventCallback)
    {
        super(callback, NftAssetsMessageParser);
    }
}

import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {PostItPlacedMessageParser} from '../../../parser/inventory/furni/PostItPlacedMessageParser';

/**
 * A post-it sheet was placed; here is what the stack has left (header 2145).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2405/_SafeCls_2404.as
 * (obfuscated; `_SafeStr_4546[2145] = _SafeCls_2404` in the registry
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/_SafeCls_2046.as, and
 * `HabboInventory.onPostItPlaced()` is its only handler.)
 */
export class PostItPlacedMessageEvent extends MessageEvent implements IMessageEvent
{
    // AS3: _SafeCls_2404.as::_SafeCls_2404()
    constructor(callback: MessageEventCallback)
    {
        super(callback, PostItPlacedMessageParser);
    }
}

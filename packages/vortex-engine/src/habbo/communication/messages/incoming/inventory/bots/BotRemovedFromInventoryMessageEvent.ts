import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    BotRemovedFromInventoryMessageParser
} from '@habbo/communication/messages/parser/inventory/bots/BotRemovedFromInventoryMessageParser';

/**
 * A bot has left the inventory (header 2032).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2864/_SafeCls_3331.as
 * (obfuscated in the primary dump; subscribed as `onBotRemoved` in
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/_SafeCls_1951.as:205).
 */
export class BotRemovedFromInventoryMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, BotRemovedFromInventoryMessageParser);
    }
}

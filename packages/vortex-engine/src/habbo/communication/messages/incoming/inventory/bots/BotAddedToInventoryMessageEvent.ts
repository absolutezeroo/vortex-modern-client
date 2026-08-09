import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    BotAddedToInventoryMessageParser
} from '@habbo/communication/messages/parser/inventory/bots/BotAddedToInventoryMessageParser';

/**
 * A single bot has entered the inventory (header 3570).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2864/_SafeCls_3954.as
 * (obfuscated in the primary dump; subscribed as `onBotAdded` in
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/_SafeCls_1951.as:193).
 */
export class BotAddedToInventoryMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, BotAddedToInventoryMessageParser);
    }
}

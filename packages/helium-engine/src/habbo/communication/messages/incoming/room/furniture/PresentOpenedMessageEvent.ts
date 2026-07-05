/**
 * PresentOpenedMessageEvent
 *
 * Based on AS3: com.sulake.habbo.communication.messages.incoming.room.furniture.PresentOpenedMessageEvent
 */
import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    PresentOpenedMessageEventParser
} from '@habbo/communication/messages/parser/room/furniture/PresentOpenedMessageEventParser';

export class PresentOpenedMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, PresentOpenedMessageEventParser);
    }
}

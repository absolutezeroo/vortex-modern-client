/**
 * ChatMessageEvent
 *
 * Based on AS3: com.sulake.habbo.communication.messages.incoming.room.chat.ChatMessageEvent
 */
import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {ChatMessageEventParser} from '@habbo/communication/messages/parser/room/chat/ChatMessageEventParser';

export class ChatMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, ChatMessageEventParser);
    }
}

/**
 * UserTypingMessageEvent
 *
 * Based on AS3: com.sulake.habbo.communication.messages.incoming.room.chat.UserTypingMessageEvent
 */
import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
	UserTypingMessageEventParser
} from '@habbo/communication/messages/parser/room/chat/UserTypingMessageEventParser';

export class UserTypingMessageEvent extends MessageEvent implements IMessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, UserTypingMessageEventParser);
	}
}

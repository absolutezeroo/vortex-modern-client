/**
 * OpenConnectionMessageEvent
 *
 * Based on AS3: com.sulake.habbo.communication.messages.incoming.room.session.OpenConnectionMessageEvent
 *
 * Event fired when a room connection is opened.
 */
import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
	OpenConnectionMessageParser
} from '@habbo/communication/messages/parser/room/session/OpenConnectionMessageParser';

export class OpenConnectionMessageEvent extends MessageEvent implements IMessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, OpenConnectionMessageParser);
	}
}

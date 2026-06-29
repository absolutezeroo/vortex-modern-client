/**
 * SlideObjectBundleMessageEvent
 *
 * Based on AS3: com.sulake.habbo.communication.messages.incoming.room.engine.SlideObjectBundleMessageEvent
 */
import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
	SlideObjectBundleMessageParser
} from '@habbo/communication/messages/parser/room/engine/SlideObjectBundleMessageParser';

export class SlideObjectBundleMessageEvent extends MessageEvent implements IMessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, SlideObjectBundleMessageParser);
	}
}

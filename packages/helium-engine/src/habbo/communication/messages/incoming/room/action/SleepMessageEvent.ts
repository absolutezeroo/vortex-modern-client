/**
 * SleepMessageEvent
 *
 * Based on AS3: com.sulake.habbo.communication.messages.incoming.room.action.SleepMessageEvent
 */
import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {SleepMessageEventParser} from '@habbo/communication/messages/parser/room/action/SleepMessageEventParser';

export class SleepMessageEvent extends MessageEvent implements IMessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, SleepMessageEventParser);
	}
}

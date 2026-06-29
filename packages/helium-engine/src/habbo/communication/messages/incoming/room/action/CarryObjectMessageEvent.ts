/**
 * CarryObjectMessageEvent
 *
 * Based on AS3: com.sulake.habbo.communication.messages.incoming.room.action.CarryObjectMessageEvent
 */
import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
	CarryObjectMessageEventParser
} from '@habbo/communication/messages/parser/room/action/CarryObjectMessageEventParser';

export class CarryObjectMessageEvent extends MessageEvent implements IMessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, CarryObjectMessageEventParser);
	}
}

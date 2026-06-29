/**
 * ItemUpdateMessageEvent
 *
 * Based on AS3: com.sulake.habbo.communication.messages.incoming.room.engine.ItemUpdateMessageEvent
 */
import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {ItemUpdateMessageParser} from '@habbo/communication/messages/parser/room/engine/ItemUpdateMessageParser';

export class ItemUpdateMessageEvent extends MessageEvent implements IMessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, ItemUpdateMessageParser);
	}
}

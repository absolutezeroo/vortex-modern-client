/**
 * ItemRemoveMessageEvent
 *
 * Based on AS3: com.sulake.habbo.communication.messages.incoming.room.engine.ItemRemoveMessageEvent
 */
import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {ItemRemoveMessageParser} from '@habbo/communication/messages/parser/room/engine/ItemRemoveMessageParser';

export class ItemRemoveMessageEvent extends MessageEvent implements IMessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, ItemRemoveMessageParser);
	}
}

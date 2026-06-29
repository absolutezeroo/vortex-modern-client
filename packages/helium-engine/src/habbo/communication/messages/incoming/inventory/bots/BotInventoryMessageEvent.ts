import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {BotInventoryMessageParser} from '@habbo/communication/messages/parser/inventory/bots/BotInventoryMessageParser';

/**
 * @see source_as_win63/habbo/communication/messages/incoming/inventory/bots/BotInventoryEvent.as
 */
export class BotInventoryMessageEvent extends MessageEvent implements IMessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, BotInventoryMessageParser);
	}
}

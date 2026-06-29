import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
	TradingItemListMessageParser
} from '@habbo/communication/messages/parser/inventory/trading/TradingItemListMessageParser';

/**
 * @see source_as_win63/habbo/communication/messages/incoming/inventory/trading/TradingItemListEvent.as
 */
export class TradingItemListMessageEvent extends MessageEvent implements IMessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, TradingItemListMessageParser);
	}
}

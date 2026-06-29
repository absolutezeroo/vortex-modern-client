import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
	TradingCloseMessageParser
} from '@habbo/communication/messages/parser/inventory/trading/TradingCloseMessageParser';

/**
 * @see source_as_win63/habbo/communication/messages/incoming/inventory/trading/TradingCloseEvent.as
 */
export class TradingCloseMessageEvent extends MessageEvent implements IMessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, TradingCloseMessageParser);
	}
}

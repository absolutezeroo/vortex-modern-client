import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
	TradingNotOpenMessageParser
} from '@habbo/communication/messages/parser/inventory/trading/TradingNotOpenMessageParser';

/**
 * @see source_as_win63/habbo/communication/messages/incoming/inventory/trading/TradingNotOpenEvent.as
 */
export class TradingNotOpenMessageEvent extends MessageEvent implements IMessageEvent
{
	constructor(callback: MessageEventCallback)
	{
		super(callback, TradingNotOpenMessageParser);
	}
}

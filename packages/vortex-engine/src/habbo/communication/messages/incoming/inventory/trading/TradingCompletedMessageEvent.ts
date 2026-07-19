import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    TradingCompletedMessageParser
} from '@habbo/communication/messages/parser/inventory/trading/TradingCompletedMessageParser';

/**
 * @see source_as_win63/habbo/communication/messages/incoming/inventory/trading/TradingCompletedEvent.as
 */
export class TradingCompletedMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, TradingCompletedMessageParser);
    }
}

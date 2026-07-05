import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    TradingConfirmationMessageParser
} from '@habbo/communication/messages/parser/inventory/trading/TradingConfirmationMessageParser';

/**
 * @see source_as_win63/habbo/communication/messages/incoming/inventory/trading/TradingConfirmationEvent.as
 */
export class TradingConfirmationMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, TradingConfirmationMessageParser);
    }
}

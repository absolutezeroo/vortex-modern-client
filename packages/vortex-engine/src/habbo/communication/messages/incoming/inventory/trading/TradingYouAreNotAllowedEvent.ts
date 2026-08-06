import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    TradingYouAreNotAllowedEventParser
} from '@habbo/communication/messages/parser/inventory/trading/TradingYouAreNotAllowedEventParser';

/**
 * AS3: sources/win63_version/habbo/communication/messages/incoming/inventory/trading/TradingYouAreNotAllowedEvent.as
 * (`_SafeCls_3671` in the primary tree; header 2294 from its registry, corroborated by the
 * emulator as `TradingYouAreNotAllowedComposer`)
 */
export class TradingYouAreNotAllowedEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, TradingYouAreNotAllowedEventParser);
    }
}

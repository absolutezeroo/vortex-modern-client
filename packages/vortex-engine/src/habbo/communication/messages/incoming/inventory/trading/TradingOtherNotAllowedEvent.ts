import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    TradingOtherNotAllowedEventParser
} from '@habbo/communication/messages/parser/inventory/trading/TradingOtherNotAllowedEventParser';

/**
 * AS3: sources/win63_version/habbo/communication/messages/incoming/inventory/trading/TradingOtherNotAllowedEvent.as
 * (`_SafeCls_3845` in the primary tree; header 814 from its registry, corroborated by the
 * emulator as `TradingOtherNotAllowedComposer`)
 */
export class TradingOtherNotAllowedEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, TradingOtherNotAllowedEventParser);
    }
}

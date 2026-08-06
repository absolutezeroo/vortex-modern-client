import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    TradeOpenFailedEventParser
} from '@habbo/communication/messages/parser/inventory/trading/TradeOpenFailedEventParser';

/**
 * AS3: sources/win63_version/habbo/communication/messages/incoming/inventory/trading/TradeOpenFailedEvent.as
 * (`_SafeCls_3581` in the primary tree; header 2855 from its registry, corroborated by the
 * emulator as `TradeOpenFailedComposer`)
 */
export class TradeOpenFailedEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, TradeOpenFailedEventParser);
    }
}

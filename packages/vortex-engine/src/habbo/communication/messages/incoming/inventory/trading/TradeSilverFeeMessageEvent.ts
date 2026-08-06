import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    TradeSilverFeeMessageEventParser
} from '@habbo/communication/messages/parser/inventory/trading/TradeSilverFeeMessageEventParser';

/**
 * AS3: sources/win63_version/habbo/communication/messages/incoming/inventory/trading/TradeSilverFeeMessageEvent.as
 * (`_SafeCls_3250` in the primary tree; header 3497 from its registry, corroborated by the
 * emulator as `TradeSilverFeeMessageComposer`)
 */
export class TradeSilverFeeMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, TradeSilverFeeMessageEventParser);
    }
}

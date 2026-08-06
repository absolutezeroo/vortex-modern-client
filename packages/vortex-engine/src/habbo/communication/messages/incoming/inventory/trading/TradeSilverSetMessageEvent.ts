import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    TradeSilverSetMessageEventParser
} from '@habbo/communication/messages/parser/inventory/trading/TradeSilverSetMessageEventParser';

/**
 * AS3: sources/win63_version/habbo/communication/messages/incoming/inventory/trading/TradeSilverSetMessageEvent.as
 * (`_SafeCls_3565` in the primary tree; header 1490 from its registry, corroborated by the
 * emulator as `TradeSilverSetMessageComposer`)
 */
export class TradeSilverSetMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, TradeSilverSetMessageEventParser);
    }
}

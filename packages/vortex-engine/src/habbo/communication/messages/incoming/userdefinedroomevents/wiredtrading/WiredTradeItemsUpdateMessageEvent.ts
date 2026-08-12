import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    WiredTradeItemsUpdateMessageParser
} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/trade/WiredTradeItemsUpdateMessageParser';

/**
 * Incoming: what is on the table changing (WIN63 header 2488).
 *
 * Name DERIVED alongside its parser, from the handler that consumes it in
 * `inventory/_SafeCls_1951.as`; the AS3 event class is obfuscated.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3111/_SafeCls_3110.as
 */
export class WiredTradeItemsUpdateMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, WiredTradeItemsUpdateMessageParser);
    }
}

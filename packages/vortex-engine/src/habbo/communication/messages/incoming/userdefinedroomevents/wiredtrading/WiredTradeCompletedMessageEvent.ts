import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    WiredTradeCompletedMessageParser
} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/trade/WiredTradeCompletedMessageParser';

/**
 * Incoming: a wired trade going through (WIN63 header 2137).
 *
 * Name DERIVED alongside its parser, from the handler that consumes it in
 * `inventory/_SafeCls_1951.as`; the AS3 event class is obfuscated.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3111/_SafeCls_3951.as
 */
export class WiredTradeCompletedMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, WiredTradeCompletedMessageParser);
    }
}

import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    WiredTransactionDetailsMessageParser
} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/WiredTransactionDetailsMessageParser';

/**
 * One transaction's full breakdown — header 1306 in WIN63's registry
 * (`_SafeCls_2046.as::_events[1306]`).
 *
 * Always the answer to a click on a log row's "details" cell; nothing pushes it unprompted, and the
 * controller has no id to match against because only one request can be outstanding.
 *
 * **Name DERIVED** — no unobfuscated tree carries the wired-chest messages and vortex-emulator has
 * no constant for 1306.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3177/_SafeCls_3176.as
 */
export class WiredTransactionDetailsMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, WiredTransactionDetailsMessageParser);
    }
}

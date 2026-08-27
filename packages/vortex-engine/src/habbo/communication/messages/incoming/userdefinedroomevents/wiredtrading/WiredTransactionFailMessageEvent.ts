import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    WiredTransactionFailMessageParser
} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/WiredTransactionFailMessageParser';

/**
 * A wired transaction was refused — header 352 in WIN63's registry
 * (`_SafeCls_2046.as::_events[352]`). Subscribed by the notification handler, which turns it into a
 * toast; unlike its success counterpart it has no reward window, so nothing else listens.
 *
 * **Name DERIVED** — no unobfuscated tree carries it and the emulator has no constant for 352.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3177/_SafeCls_3540.as
 */
export class WiredTransactionFailMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, WiredTransactionFailMessageParser);
    }
}

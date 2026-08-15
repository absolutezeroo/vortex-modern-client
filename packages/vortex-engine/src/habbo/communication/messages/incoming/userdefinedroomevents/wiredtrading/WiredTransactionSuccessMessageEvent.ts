import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    WiredTransactionSuccessMessageParser
} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/WiredTransactionSuccessMessageParser';

/**
 * A wired transaction completed — header 2677 in WIN63's registry
 * (`_SafeCls_2046.as::_events[2677]`). Subscribed by `RewardNotificationController`, which shows the
 * reward window when the payload says to.
 *
 * **Name DERIVED** — no unobfuscated tree carries it and the emulator has no constant for 2677.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3177/_SafeCls_3244.as
 */
export class WiredTransactionSuccessMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, WiredTransactionSuccessMessageParser);
    }
}

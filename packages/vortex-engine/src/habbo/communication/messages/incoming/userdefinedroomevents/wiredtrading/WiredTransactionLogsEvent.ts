import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    WiredTransactionLogsEventParser
} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/WiredTransactionLogsEventParser';

/**
 * A page of wired-chest transaction logs — header 2910 in WIN63's registry
 * (`_SafeCls_2046.as::_events[2910]`).
 *
 * **Two windows share this one header**, and the payload says which asked: the chests tab's ten-row
 * preview and the paged transactions window both subscribe, and each drops a page whose
 * `logListType` is not its own.
 *
 * **Name DERIVED** — no unobfuscated tree carries this message (`win63_version` predates wired
 * chests) and vortex-emulator has no constant for 2910. Named for what it delivers.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3177/_SafeCls_3439.as
 */
export class WiredTransactionLogsEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, WiredTransactionLogsEventParser);
    }
}

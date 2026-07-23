import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {WiredErrorLogsParser} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredmenu/WiredErrorLogsParser';

/**
 * WiredErrorLogsEvent — incoming wired execution-error log for the monitor tab (WIN63 header 3419).
 *
 * Name derived: fully obfuscated in AS3 (class `_SafeCls_2891`); named for its role.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2538/_SafeCls_2891.as
 */
export class WiredErrorLogsEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, WiredErrorLogsParser);
    }
}

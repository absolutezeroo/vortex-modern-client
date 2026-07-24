import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {WiredMenuErrorParser} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredmenu/WiredMenuErrorParser';

/**
 * WiredMenuErrorEvent — incoming wired-menu error push for the inspection tab (WIN63 header 1230).
 *
 * Name derived: fully obfuscated in AS3 (class `_SafeCls_2847`, `src/unknowns/_SafePkg_2538/`); named
 * for its role.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2538/_SafeCls_2847.as
 */
export class WiredMenuErrorEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, WiredMenuErrorParser);
    }
}

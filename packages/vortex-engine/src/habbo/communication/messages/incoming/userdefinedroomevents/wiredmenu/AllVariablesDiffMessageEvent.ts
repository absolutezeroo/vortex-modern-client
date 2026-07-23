/**
 * AllVariablesDiffMessageEvent — incoming chunk of the wired-variable delta (WIN63 header 2733).
 *
 * Name derived: fully obfuscated in AS3 (class `_SafeCls_3780`); named for its role.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2538/_SafeCls_3780.as
 */
import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    AllVariablesDiffMessageParser
} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredmenu/AllVariablesDiffMessageParser';

export class AllVariablesDiffMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, AllVariablesDiffMessageParser);
    }
}

/**
 * AllVariablesHashMessageEvent — incoming hash of the room's wired-variable set (WIN63 header 3287).
 *
 * Name derived: fully obfuscated in AS3 (class `_SafeCls_2965`); named for its role.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2538/_SafeCls_2965.as
 */
import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    AllVariablesHashMessageParser
} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredmenu/AllVariablesHashMessageParser';

export class AllVariablesHashMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, AllVariablesHashMessageParser);
    }
}

import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {WiredUserVariablesPageParser} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredmenu/WiredUserVariablesPageParser';

/**
 * WiredUserVariablesPageMessageEvent — incoming page of the variable-management overview (WIN63
 * header 749).
 *
 * Name derived: fully obfuscated in AS3 (class `_SafeCls_2492`, `src/unknowns/_SafePkg_2493/`); named
 * for its role.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2493/_SafeCls_2492.as
 */
export class WiredUserVariablesPageMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, WiredUserVariablesPageParser);
    }
}

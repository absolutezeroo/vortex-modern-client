import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {VariableInfoAndHoldersParser} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredmenu/VariableInfoAndHoldersParser';

/**
 * VariableInfoAndHoldersEvent — incoming "variable holders" push for the overview tab's highlight
 * feature (WIN63 header 3506).
 *
 * Name derived: fully obfuscated in AS3 (class `_SafeCls_2537`, `src/unknowns/_SafePkg_2538/`); named
 * for its role.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2538/_SafeCls_2537.as
 */
export class VariableInfoAndHoldersEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, VariableInfoAndHoldersParser);
    }
}

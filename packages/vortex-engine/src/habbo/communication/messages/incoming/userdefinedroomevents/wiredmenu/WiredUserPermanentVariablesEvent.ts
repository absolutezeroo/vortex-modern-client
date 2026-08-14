import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    WiredUserPermanentVariablesEventParser
} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredmenu/WiredUserPermanentVariablesEventParser';

/**
 * The permanent-variable list for one holder, header 1557 in WIN63's registry
 * (`_SafeCls_2046.as::_events[1557]`). Subscribed by `VariableManagementDetailController`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2493/_SafeCls_3146.as
 * (name recovered from `sources/win63_version/.../variablesmanagement/
 * WiredUserPermanentVariablesEvent.as`)
 */
export class WiredUserPermanentVariablesEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, WiredUserPermanentVariablesEventParser);
    }
}

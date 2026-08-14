import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {
    WiredSetUserPermanentVariableResultEventParser
} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredmenu/WiredSetUserPermanentVariableResultEventParser';

/**
 * The server's verdict on a permanent-variable set/create/delete, header 1643 in WIN63's registry
 * (`_SafeCls_2046.as::_events[1643]`). Subscribed by `VariableManagementDetailController`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2493/_SafeCls_2757.as
 * (name recovered from `sources/win63_version/.../variablesmanagement/
 * WiredSetUserPermanentVariableResultEvent.as`)
 */
export class WiredSetUserPermanentVariableResultEvent extends MessageEvent implements IMessageEvent
{
    constructor(callback: MessageEventCallback)
    {
        super(callback, WiredSetUserPermanentVariableResultEventParser);
    }
}

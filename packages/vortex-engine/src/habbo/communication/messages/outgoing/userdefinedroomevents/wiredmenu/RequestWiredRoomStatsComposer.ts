import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * RequestWiredRoomStatsComposer — asks the server for the monitor tab's room stats (WIN63 header 427).
 * No payload.
 *
 * Name derived: fully obfuscated in AS3 (class `_SafeCls_3423`); named for its role.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/outgoing/userdefinedroomevents/wiredmenu/_SafeCls_3423.as
 */
export class RequestWiredRoomStatsComposer extends MessageComposer<[]>
{
    // AS3: _SafeCls_3423.as::getMessageArray()
    getMessageArray(): []
    {
        return [];
    }
}

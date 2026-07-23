import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * GetAllVariablesMessageComposer — requests the room's full wired-variable set (WIN63 header 984). No
 * payload; the server replies with the AllVariablesHash event.
 *
 * Name derived: fully obfuscated in AS3 (class `_SafeCls_3463`); named for its role.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/outgoing/userdefinedroomevents/wiredmenu/_SafeCls_3463.as
 */
export class GetAllVariablesMessageComposer extends MessageComposer<[]>
{
    // AS3: _SafeCls_3463.as::getMessageArray()
    getMessageArray(): []
    {
        return [];
    }
}

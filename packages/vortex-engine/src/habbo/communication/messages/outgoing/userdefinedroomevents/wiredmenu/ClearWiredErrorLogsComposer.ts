import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * ClearWiredErrorLogsComposer — clears the room's wired execution-error log (WIN63 header 2386). No
 * payload.
 *
 * Name derived: fully obfuscated in AS3 (class `_SafeCls_3329`); named for its role.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/outgoing/userdefinedroomevents/wiredmenu/_SafeCls_3329.as
 */
export class ClearWiredErrorLogsComposer extends MessageComposer<[]>
{
    // AS3: _SafeCls_3329.as::getMessageArray()
    getMessageArray(): []
    {
        return [];
    }
}

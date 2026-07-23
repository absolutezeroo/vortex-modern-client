import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * RequestWiredErrorLogsComposer — asks the server for the monitor tab's execution-error log (WIN63
 * header 452). No payload.
 *
 * Name derived: fully obfuscated in AS3 (class `_SafeCls_2630`); named for its role.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/outgoing/userdefinedroomevents/wiredmenu/_SafeCls_2630.as
 */
export class RequestWiredErrorLogsComposer extends MessageComposer<[]>
{
    // AS3: _SafeCls_2630.as::getMessageArray()
    getMessageArray(): []
    {
        return [];
    }
}

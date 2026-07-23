import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * RequestWiredMenuSettingsComposer — asks the server for the wired-menu settings (permission masks +
 * timezone) the settings tab renders (WIN63 header 1862). No payload.
 *
 * Name derived: fully obfuscated in AS3 (class `_SafeCls_3420`); named for its role.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/outgoing/userdefinedroomevents/wiredmenu/_SafeCls_3420.as
 */
export class RequestWiredMenuSettingsComposer extends MessageComposer<[]>
{
    // AS3: _SafeCls_3420.as::getMessageArray()
    getMessageArray(): []
    {
        return [];
    }
}

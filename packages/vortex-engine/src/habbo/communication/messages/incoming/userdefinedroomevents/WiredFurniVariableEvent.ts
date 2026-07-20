import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {WiredFurniVariableMessageParser} from '@habbo/communication/messages/parser/userdefinedroomevents/WiredFurniVariableMessageParser';

/**
 * Incoming "wired furni variable" event. Wraps WiredFurniVariableMessageParser, the
 * definition-load response for a wired variable furni's configuration UI.
 *
 * Name derived: describes the wired-variable furni event it wraps (WIN63 obfuscated
 * _SafeCls_3199 = "_-OG"; no counterpart in vortex-flash-client).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/incoming/userdefinedroomevents/_SafeCls_3199.as
 */
export class WiredFurniVariableEvent extends MessageEvent implements IMessageEvent
{
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/incoming/userdefinedroomevents/_SafeCls_3199.as::WiredFurniVariableEvent()
    constructor(callback: MessageEventCallback)
    {
        super(callback, WiredFurniVariableMessageParser);
    }
}

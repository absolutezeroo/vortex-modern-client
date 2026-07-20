import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {WiredFurniAddonMessageParser} from '@habbo/communication/messages/parser/userdefinedroomevents/WiredFurniAddonMessageParser';

/**
 * Incoming wired-furni "addon" configuration event. Wraps WiredFurniAddonMessageParser.
 *
 * Name derived: WIN63 obfuscated (_SafeCls_3130 = "_-52"); no counterpart in vortex-flash-client.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/incoming/userdefinedroomevents/_SafeCls_3130.as
 */
export class WiredFurniAddonEvent extends MessageEvent implements IMessageEvent
{
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/incoming/userdefinedroomevents/_SafeCls_3130.as::WiredFurniAddonEvent()
    constructor(callback: MessageEventCallback)
    {
        super(callback, WiredFurniAddonMessageParser);
    }
}

import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import {WiredFurniActionMessageParser} from '@habbo/communication/messages/parser/userdefinedroomevents/WiredFurniActionMessageParser';

/**
 * Incoming wired-furni action configuration event. Wraps WiredFurniActionMessageParser,
 * which parses the action definition sent when the user opens a wired action furni.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/incoming/userdefinedroomevents/_SafeCls_3816.as
 */
export class WiredFurniActionEvent extends MessageEvent implements IMessageEvent
{
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/incoming/userdefinedroomevents/_SafeCls_3816.as::WiredFurniActionEvent()
    constructor(callback: MessageEventCallback)
    {
        super(callback, WiredFurniActionMessageParser);
    }
}

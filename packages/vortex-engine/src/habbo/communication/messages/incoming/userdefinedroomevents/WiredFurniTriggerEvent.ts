import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import {WiredFurniTriggerMessageParser} from '@habbo/communication/messages/parser/userdefinedroomevents/WiredFurniTriggerMessageParser';

/**
 * Incoming "wired furni trigger" configuration event. Wraps WiredFurniTriggerMessageParser,
 * which carries the selected trigger's TriggerDefinition (name, params, allowed conditions/actions).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/incoming/userdefinedroomevents/_SafeCls_3224.as
 */
export class WiredFurniTriggerEvent extends MessageEvent implements IMessageEvent
{
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/incoming/userdefinedroomevents/_SafeCls_3224.as::WiredFurniTriggerEvent()
    constructor(callback: MessageEventCallback)
    {
        super(callback, WiredFurniTriggerMessageParser);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/incoming/userdefinedroomevents/_SafeCls_3224.as::getParser()
    override getParser<T extends IMessageParser = WiredFurniTriggerMessageParser>(): T
    {
        return this._parser as T;
    }
}

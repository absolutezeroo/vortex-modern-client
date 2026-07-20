import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import {WiredFurniConditionMessageParser} from '@habbo/communication/messages/parser/userdefinedroomevents/WiredFurniConditionMessageParser';

/**
 * Incoming "wired furni condition" configuration event. Wraps WiredFurniConditionMessageParser,
 * which carries the selected condition's ConditionDefinition (name, params, allowed triggers/actions).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/incoming/userdefinedroomevents/_SafeCls_3178.as
 */
export class WiredFurniConditionEvent extends MessageEvent implements IMessageEvent
{
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/incoming/userdefinedroomevents/_SafeCls_3178.as::WiredFurniConditionEvent()
    constructor(callback: MessageEventCallback)
    {
        super(callback, WiredFurniConditionMessageParser);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/incoming/userdefinedroomevents/_SafeCls_3178.as::getParser()
    override getParser<T extends IMessageParser = WiredFurniConditionMessageParser>(): T
    {
        return this._parser as T;
    }
}

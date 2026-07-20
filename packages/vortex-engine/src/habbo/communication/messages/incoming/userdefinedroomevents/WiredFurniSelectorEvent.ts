import {MessageEvent} from '@core/communication/messages/MessageEvent';
import type {IMessageEvent, MessageEventCallback} from '@core/communication/messages/IMessageEvent';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import {WiredFurniSelectorMessageParser} from '@habbo/communication/messages/parser/userdefinedroomevents/WiredFurniSelectorMessageParser';

/**
 * Incoming "wired furni selector" configuration event. Wraps WiredFurniSelectorMessageParser,
 * which carries the selected selector furni's SelectorDefinition and WiredContext.
 *
 * Name derived: the WIN63 class is obfuscated as _SafeCls_2636 (@identifier "_-op"); there is
 * no counterpart in vortex-flash-client. Named after the WiredFurniSelectorMessageParser it wraps.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/incoming/userdefinedroomevents/_SafeCls_2636.as
 */
export class WiredFurniSelectorEvent extends MessageEvent implements IMessageEvent
{
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/incoming/userdefinedroomevents/_SafeCls_2636.as::WiredFurniSelectorEvent()
    constructor(callback: MessageEventCallback)
    {
        super(callback, WiredFurniSelectorMessageParser);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/incoming/userdefinedroomevents/_SafeCls_2636.as::getParser()
    override getParser<T extends IMessageParser = WiredFurniSelectorMessageParser>(): T
    {
        return this._parser as T;
    }
}

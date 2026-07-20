import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {TriggerDefinition} from '@habbo/communication/messages/incoming/userdefinedroomevents/TriggerDefinition';

/**
 * Parser for the wired-furni "trigger" configuration push: builds the {@link TriggerDefinition}
 * describing the trigger currently being edited on a wired furni.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/parser/userdefinedroomevents/WiredFurniTriggerMessageParser.as
 */
export class WiredFurniTriggerMessageParser implements IMessageParser
{
    // AS3: WiredFurniTriggerMessageParser.as::get def() (backing field)
    private _def: TriggerDefinition | null = null;

    // AS3: WiredFurniTriggerMessageParser.as::flush()
    flush(): boolean
    {
        this._def = null;
        return true;
    }

    // AS3: WiredFurniTriggerMessageParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._def = new TriggerDefinition(wrapper);
        return true;
    }

    // AS3: WiredFurniTriggerMessageParser.as::get def()
    get def(): TriggerDefinition | null
    {
        return this._def;
    }
}

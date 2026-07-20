import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {ConditionDefinition} from '@habbo/communication/messages/incoming/userdefinedroomevents/ConditionDefinition';

/**
 * Parser for the wired-furni condition configuration push: builds the ConditionDefinition
 * DTO describing a wired condition furni's current server-side setup.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/parser/userdefinedroomevents/_SafeCls_3786.as
 */
export class WiredFurniConditionMessageParser implements IMessageParser
{
    // AS3: _SafeCls_3786.as::_SafeStr_7558 (def)
    private _def: ConditionDefinition | null = null;

    // AS3: _SafeCls_3786.as::flush()
    flush(): boolean
    {
        this._def = null;
        return true;
    }

    // AS3: _SafeCls_3786.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._def = new ConditionDefinition(wrapper);
        return true;
    }

    // AS3: _SafeCls_3786.as::get def()
    get def(): ConditionDefinition | null
    {
        return this._def;
    }
}

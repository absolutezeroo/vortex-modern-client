import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {ActionDefinition} from '@habbo/communication/messages/incoming/userdefinedroomevents/ActionDefinition';

/**
 * Parser for the wired-furni action configuration push: builds the ActionDefinition
 * DTO describing a wired action furni's current server-side setup.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/parser/userdefinedroomevents/_SafeCls_3825.as
 */
export class WiredFurniActionMessageParser implements IMessageParser
{
    // AS3: _SafeCls_3825.as::_SafeStr_7558 (def)
    private _def: ActionDefinition | null = null;

    // AS3: _SafeCls_3825.as::flush()
    flush(): boolean
    {
        this._def = null;
        return true;
    }

    // AS3: _SafeCls_3825.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._def = new ActionDefinition(wrapper);
        return true;
    }

    // AS3: _SafeCls_3825.as::get def()
    get def(): ActionDefinition | null
    {
        return this._def;
    }
}

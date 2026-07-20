import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {VariableDefinition} from '@habbo/communication/messages/incoming/userdefinedroomevents/VariableDefinition';

/**
 * Parser for the wired-furni variable configuration push: builds the VariableDefinition
 * DTO describing a wired variable furni's current server-side setup.
 *
 * Name derived: sibling of WiredFurniAction/Condition/AddonMessageParser, the "variable"
 * flavour, parsing a VariableDefinition (WIN63 obfuscated _SafeCls_2705; no counterpart in
 * vortex-flash-client).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/parser/userdefinedroomevents/_SafeCls_2705.as
 */
export class WiredFurniVariableMessageParser implements IMessageParser
{
    // AS3: _SafeCls_2705.as::_SafeStr_7558 (def)
    private _def: VariableDefinition | null = null;

    // AS3: _SafeCls_2705.as::flush()
    flush(): boolean
    {
        this._def = null;
        return true;
    }

    // AS3: _SafeCls_2705.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._def = new VariableDefinition(wrapper);
        return true;
    }

    // AS3: _SafeCls_2705.as::get def()
    get def(): VariableDefinition | null
    {
        return this._def;
    }
}

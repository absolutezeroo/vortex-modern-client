import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {AddonDefinition} from '@habbo/communication/messages/incoming/userdefinedroomevents/AddonDefinition';

/**
 * Parser for the wired-furni addon configuration push: builds the AddonDefinition
 * DTO describing a wired addon furni's current server-side setup.
 *
 * Name derived: WIN63 obfuscated class `_SafeCls_3163` with no counterpart in
 * vortex-flash-client; named after the AddonDefinition (`_SafeCls_2727`) DTO it parses,
 * matching the sibling WiredFurni*MessageParser family.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/parser/userdefinedroomevents/_SafeCls_3163.as
 */
export class WiredFurniAddonMessageParser implements IMessageParser
{
    // AS3: _SafeCls_3163.as::_SafeStr_7558 (def)
    private _def: AddonDefinition | null = null;

    // AS3: _SafeCls_3163.as::flush()
    flush(): boolean
    {
        this._def = null;
        return true;
    }

    // AS3: _SafeCls_3163.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._def = new AddonDefinition(wrapper);
        return true;
    }

    // AS3: _SafeCls_3163.as::get def()
    get def(): AddonDefinition | null
    {
        return this._def;
    }
}

import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {SelectorDefinition} from '@habbo/communication/messages/incoming/userdefinedroomevents/SelectorDefinition';

/**
 * Parser for the wired-furni selector configuration push: builds the SelectorDefinition
 * DTO that describes the currently-open wired selector furni.
 *
 * Name derived: WIN63's class is obfuscated (_SafeCls_3553) and this 2026 message has no
 * counterpart in vortex-flash-client; the name is derived from behaviour (it parses a
 * SelectorDefinition, mirroring the sibling WiredFurni*MessageParser classes).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/parser/userdefinedroomevents/_SafeCls_3553.as
 */
export class WiredFurniSelectorMessageParser implements IMessageParser
{
    private _def: SelectorDefinition | null = null;

    // AS3: _SafeCls_3553.as::flush()
    flush(): boolean
    {
        this._def = null;
        return true;
    }

    // AS3: _SafeCls_3553.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._def = new SelectorDefinition(wrapper);
        return true;
    }

    // AS3: _SafeCls_3553.as::get def()
    get def(): SelectorDefinition | null
    {
        return this._def;
    }
}

import {SelectorCodes} from './SelectorCodes';
import {DefaultSelectorType} from './DefaultSelectorType';

/**
 * UsersOnFurni — the "users standing on the furni" wired selector. Takes no form inputs.
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4267`; the name follows the code it returns
 * (SelectorCodes.USERS_ON_FURNI).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/selectors/_SafeCls_4267.as
 */
export class UsersOnFurni extends DefaultSelectorType
{
    // AS3: _SafeCls_4267.as::get code()
    override get code(): number
    {
        return SelectorCodes.USERS_ON_FURNI;
    }
}

import {SelectorCodes} from './SelectorCodes';
import {DefaultSelectorType} from './DefaultSelectorType';

/**
 * UsersFromSignal — the "users forwarded from a signal" wired selector. Takes no form inputs.
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4373`; the name follows the code it returns
 * (SelectorCodes.USERS_FROM_SIGNAL).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/selectors/_SafeCls_4373.as
 */
export class UsersFromSignal extends DefaultSelectorType
{
    // AS3: _SafeCls_4373.as::get code()
    override get code(): number
    {
        return SelectorCodes.USERS_FROM_SIGNAL;
    }
}

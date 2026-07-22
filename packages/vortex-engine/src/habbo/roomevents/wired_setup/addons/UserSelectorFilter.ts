import {AddonCodes} from './AddonCodes';
import {SelectorFilter} from './SelectorFilter';

/**
 * UserSelectorFilter — the user-selector variant of SelectorFilter.
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4130`; the name follows the code it returns
 * (AddonCodes.USER_SELECTOR_FILTER).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/addons/_SafeCls_4130.as
 */
export class UserSelectorFilter extends SelectorFilter
{
    // AS3: _SafeCls_4130.as::get code()
    override get code(): number
    {
        return AddonCodes.USER_SELECTOR_FILTER;
    }
}

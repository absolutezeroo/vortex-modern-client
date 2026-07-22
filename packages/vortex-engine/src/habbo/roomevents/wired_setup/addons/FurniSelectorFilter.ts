import {AddonCodes} from './AddonCodes';
import {SelectorFilter} from './SelectorFilter';

/**
 * FurniSelectorFilter — the furni-selector variant of SelectorFilter.
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4443`; the name follows the code it returns
 * (AddonCodes.FURNI_SELECTOR_FILTER).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/addons/_SafeCls_4443.as
 */
export class FurniSelectorFilter extends SelectorFilter
{
    // AS3: _SafeCls_4443.as::get code()
    override get code(): number
    {
        return AddonCodes.FURNI_SELECTOR_FILTER;
    }
}

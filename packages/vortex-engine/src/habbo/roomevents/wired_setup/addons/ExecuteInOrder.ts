import {AddonCodes} from './AddonCodes';
import {DefaultAddonType} from './DefaultAddonType';

/**
 * ExecuteInOrder — the "execute stacked actions in order" wired addon. Takes no form inputs.
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4153`; the name follows the code it returns
 * (AddonCodes.EXECUTE_IN_ORDER).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/addons/_SafeCls_4153.as
 */
export class ExecuteInOrder extends DefaultAddonType
{
    // AS3: _SafeCls_4153.as::get code()
    override get code(): number
    {
        return AddonCodes.EXECUTE_IN_ORDER;
    }
}

import {AddonCodes} from './AddonCodes';
import {DefaultAddonType} from './DefaultAddonType';

/**
 * AddonCode2 — a parameterless wired addon with no recoverable identity. Takes no form inputs.
 *
 * Name derived: both the AS3 class (`_SafeCls_4086`) and the code it returns are obfuscated with no
 * readable counterpart in any tree (the code is value 2). The class name mirrors that derivation
 * rather than inventing a semantic label.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/addons/_SafeCls_4086.as
 */
export class AddonCode2 extends DefaultAddonType
{
    // AS3: _SafeCls_4086.as::get code()
    override get code(): number
    {
        return AddonCodes.ADDON_CODE_2;
    }
}

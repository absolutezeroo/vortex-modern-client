import {WiredVariableHolderType} from '@habbo/communication/messages/incoming/userdefinedroomevents/variables/WiredVariableHolderType';

import {AddonCodes} from './AddonCodes';
import {VariableFilter} from './VariableFilter';

/**
 * FurniVariableFilter — the furni-variable variant of VariableFilter (picker scoped to FURNI variables).
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4254`; the name follows the code it returns
 * (AddonCodes.FURNI_VARIABLE_FILTER).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/addons/_SafeCls_4254.as
 */
export class FurniVariableFilter extends VariableFilter
{
    // AS3: _SafeCls_4254.as::get variableType()
    protected override get variableType(): number
    {
        return WiredVariableHolderType.FURNI;
    }

    // AS3: _SafeCls_4254.as::get code()
    override get code(): number
    {
        return AddonCodes.FURNI_VARIABLE_FILTER;
    }
}

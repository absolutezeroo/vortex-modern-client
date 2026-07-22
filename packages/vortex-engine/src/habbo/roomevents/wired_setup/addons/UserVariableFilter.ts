import {WiredVariableHolderType} from '@habbo/communication/messages/incoming/userdefinedroomevents/variables/WiredVariableHolderType';

import {AddonCodes} from './AddonCodes';
import {VariableFilter} from './VariableFilter';

/**
 * UserVariableFilter — the user-variable variant of VariableFilter (picker scoped to USER variables).
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4346`; the name follows the code it returns
 * (AddonCodes.USER_VARIABLE_FILTER).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/addons/_SafeCls_4346.as
 */
export class UserVariableFilter extends VariableFilter
{
    // AS3: _SafeCls_4346.as::get variableType()
    protected override get variableType(): number
    {
        return WiredVariableHolderType.USER;
    }

    // AS3: _SafeCls_4346.as::get code()
    override get code(): number
    {
        return AddonCodes.USER_VARIABLE_FILTER;
    }
}

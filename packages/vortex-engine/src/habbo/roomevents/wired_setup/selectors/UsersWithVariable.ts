import {WiredInputSourcePicker} from '../inputsources/WiredInputSourcePicker';
import {SelectorCodes} from './SelectorCodes';
import {VariableSelector} from './VariableSelector';

/**
 * UsersWithVariable — the user variant of VariableSelector (picker scoped to the user source).
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4378`; the name follows the code it returns
 * (SelectorCodes.USERS_WITH_VARIABLE).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/selectors/_SafeCls_4378.as
 */
export class UsersWithVariable extends VariableSelector
{
    // AS3: _SafeCls_4378.as::get code()
    override get code(): number
    {
        return SelectorCodes.USERS_WITH_VARIABLE;
    }

    // AS3: _SafeCls_4378.as::get variableSource()
    protected override get variableSource(): number
    {
        return WiredInputSourcePicker.USER_SOURCE;
    }
}

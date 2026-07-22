import {ActionTypeCodes} from './ActionTypeCodes';
import {DefaultActionType} from './DefaultActionType';

/**
 * ToggleToRandomState — the "toggle furni to a random state" wired action.
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4094`; the name follows the code it returns
 * (ActionTypeCodes.TOGGLE_TO_RANDOM_STATE).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/actiontypes/_SafeCls_4094.as
 */
export class ToggleToRandomState extends DefaultActionType
{
    // AS3: _SafeCls_4094.as::get code()
    override get code(): number
    {
        return ActionTypeCodes.TOGGLE_TO_RANDOM_STATE;
    }
}

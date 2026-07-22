import {ActionTypeCodes} from './ActionTypeCodes';
import {DefaultActionType} from './DefaultActionType';

/**
 * UnfreezeUser — the "unfreeze user" wired action.
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4060`; the name follows the code it returns
 * (ActionTypeCodes.UNFREEZE_USER).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/actiontypes/_SafeCls_4060.as
 */
export class UnfreezeUser extends DefaultActionType
{
    // AS3: _SafeCls_4060.as::get code()
    override get code(): number
    {
        return ActionTypeCodes.UNFREEZE_USER;
    }
}

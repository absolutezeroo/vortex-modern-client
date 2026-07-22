import {ActionTypeCodes} from './ActionTypeCodes';
import {DefaultActionType} from './DefaultActionType';

/**
 * RemoveFurni — the "remove furni" wired action.
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4194`; the name follows the code it returns
 * (ActionTypeCodes.REMOVE_FURNI).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/actiontypes/_SafeCls_4194.as
 */
export class RemoveFurni extends DefaultActionType
{
    // AS3: _SafeCls_4194.as::get code()
    override get code(): number
    {
        return ActionTypeCodes.REMOVE_FURNI;
    }

    // AS3: _SafeCls_4194.as::advancedAlwaysVisible()
    override advancedAlwaysVisible(): boolean
    {
        return true;
    }
}

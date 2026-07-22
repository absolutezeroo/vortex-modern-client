import {ActionTypeCodes} from './ActionTypeCodes';
import {DefaultActionType} from './DefaultActionType';

/**
 * LeaveTeam — the "leave team" wired action.
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4038`; the name follows the code it returns
 * (ActionTypeCodes.LEAVE_TEAM).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/actiontypes/_SafeCls_4038.as
 */
export class LeaveTeam extends DefaultActionType
{
    // AS3: _SafeCls_4038.as::get code()
    override get code(): number
    {
        return ActionTypeCodes.LEAVE_TEAM;
    }
}

import {ActionTypeCodes} from './ActionTypeCodes';
import {DefaultActionType} from './DefaultActionType';

/**
 * Chase — the "chase" wired action (a bot/pet chases).
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4211`; the name follows the code it returns
 * (ActionTypeCodes.CHASE).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/actiontypes/_SafeCls_4211.as
 */
export class Chase extends DefaultActionType
{
    // AS3: _SafeCls_4211.as::get code()
    override get code(): number
    {
        return ActionTypeCodes.CHASE;
    }
}

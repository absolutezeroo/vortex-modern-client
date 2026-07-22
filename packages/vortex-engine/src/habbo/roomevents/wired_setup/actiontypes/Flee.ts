import {ActionTypeCodes} from './ActionTypeCodes';
import {DefaultActionType} from './DefaultActionType';

/**
 * Flee — the "flee" wired action (a bot/pet flees).
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4206`; the name follows the code it returns
 * (ActionTypeCodes.FLEE).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/actiontypes/_SafeCls_4206.as
 */
export class Flee extends DefaultActionType
{
    // AS3: _SafeCls_4206.as::get code()
    override get code(): number
    {
        return ActionTypeCodes.FLEE;
    }
}

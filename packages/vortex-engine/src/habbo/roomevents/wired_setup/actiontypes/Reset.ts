import {ActionTypeCodes} from './ActionTypeCodes';
import {DefaultActionType} from './DefaultActionType';

/**
 * Reset — the "reset" wired action (resets the wired stack / furni). Slightly wider layout.
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4433`; the name follows the code it returns
 * (ActionTypeCodes.RESET).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/actiontypes/_SafeCls_4433.as
 */
export class Reset extends DefaultActionType
{
    // AS3: _SafeCls_4433.as::get code()
    override get code(): number
    {
        return ActionTypeCodes.RESET;
    }

    // AS3: _SafeCls_4433.as::get widthModifier()
    override get widthModifier(): number
    {
        return 1.06;
    }
}

import {ActionTypeCodes} from './ActionTypeCodes';
import {DefaultActionType} from './DefaultActionType';

/**
 * CallAnotherStack — the "call another wired stack" action (positive code fires it, negative code is
 * the inverse/off variant).
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4274`; the name follows the code it returns
 * (ActionTypeCodes.CALL_ANOTHER_STACK).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/actiontypes/_SafeCls_4274.as
 */
export class CallAnotherStack extends DefaultActionType
{
    // AS3: _SafeCls_4274.as::get code()
    override get code(): number
    {
        return ActionTypeCodes.CALL_ANOTHER_STACK;
    }

    // AS3: _SafeCls_4274.as::get negativeCode()
    override get negativeCode(): number
    {
        return ActionTypeCodes.NEG_CALL_ANOTHER_STACK;
    }
}

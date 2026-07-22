import {ConditionCodes} from './ConditionCodes';
import {DefaultConditionType} from './DefaultConditionType';

/**
 * CanPerformMove — the "the move can be performed" wired condition. Takes no form inputs.
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4138`; the name follows the code it returns
 * (ConditionCodes.CAN_PERFORM_MOVE).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/conditions/_SafeCls_4138.as
 */
export class CanPerformMove extends DefaultConditionType
{
    // AS3: _SafeCls_4138.as::get code()
    override get code(): number
    {
        return ConditionCodes.CAN_PERFORM_MOVE;
    }
}

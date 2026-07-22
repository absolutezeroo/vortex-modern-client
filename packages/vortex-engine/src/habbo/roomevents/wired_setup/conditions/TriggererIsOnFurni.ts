import {ConditionCodes} from './ConditionCodes';
import {DefaultConditionType} from './DefaultConditionType';

/**
 * TriggererIsOnFurni — the "the triggering user stands on the furni" wired condition. Takes no form
 * inputs; exposes the negation (NOT_TRIGGERER_IS_ON_FURNI).
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4403`; the name follows the code it returns
 * (ConditionCodes.TRIGGERER_IS_ON_FURNI).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/conditions/_SafeCls_4403.as
 */
export class TriggererIsOnFurni extends DefaultConditionType
{
    // AS3: _SafeCls_4403.as::get code()
    override get code(): number
    {
        return ConditionCodes.TRIGGERER_IS_ON_FURNI;
    }

    // AS3: _SafeCls_4403.as::get negativeCode()
    override get negativeCode(): number
    {
        return ConditionCodes.NOT_TRIGGERER_IS_ON_FURNI;
    }
}

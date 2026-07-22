import {TriggerConfCodes} from './TriggerConfCodes';
import {DefaultTriggerConf} from './DefaultTriggerConf';

/**
 * AvatarCaught — the "an avatar is caught" wired trigger. Takes no form inputs.
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4327`; the name follows the code it returns
 * (TriggerConfCodes.AVATAR_CAUGHT). AS3 declares two identical trigger confs for this code — this one
 * and AvatarCaught2 (=_SafeCls_4218) — and the registry registers both.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/triggerconfs/_SafeCls_4327.as
 */
export class AvatarCaught extends DefaultTriggerConf
{
    // AS3: _SafeCls_4327.as::get code()
    override get code(): number
    {
        return TriggerConfCodes.AVATAR_CAUGHT;
    }
}

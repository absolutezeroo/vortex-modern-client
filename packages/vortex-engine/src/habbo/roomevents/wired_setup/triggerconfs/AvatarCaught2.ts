import {TriggerConfCodes} from './TriggerConfCodes';
import {DefaultTriggerConf} from './DefaultTriggerConf';

/**
 * AvatarCaught2 — a second "an avatar is caught" wired trigger, byte-identical to AvatarCaught. AS3
 * declares two trigger confs for AVATAR_CAUGHT and the registry registers both; the port keeps both
 * as distinct classes to preserve that registration. Takes no form inputs.
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4218`; the name follows the code it returns
 * (TriggerConfCodes.AVATAR_CAUGHT), disambiguated from AvatarCaught (=_SafeCls_4327).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/triggerconfs/_SafeCls_4218.as
 */
export class AvatarCaught2 extends DefaultTriggerConf
{
    // AS3: _SafeCls_4218.as::get code()
    override get code(): number
    {
        return TriggerConfCodes.AVATAR_CAUGHT;
    }
}

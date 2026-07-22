import {TriggerConfCodes} from './TriggerConfCodes';
import {DefaultTriggerConf} from './DefaultTriggerConf';

/**
 * AvatarClicksFurni — the "an avatar clicks the furni" wired trigger. Takes no form inputs.
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4156`; the name follows the code it returns
 * (TriggerConfCodes.AVATAR_CLICKS_FURNI).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/triggerconfs/_SafeCls_4156.as
 */
export class AvatarClicksFurni extends DefaultTriggerConf
{
    // AS3: _SafeCls_4156.as::get code()
    override get code(): number
    {
        return TriggerConfCodes.AVATAR_CLICKS_FURNI;
    }
}

import {TriggerConfCodes} from './TriggerConfCodes';
import {DefaultTriggerConf} from './DefaultTriggerConf';

/**
 * AvatarWalksOffFurni — the "an avatar walks off the furni" wired trigger. Takes no form inputs.
 *
 * Name recovered: the AS3 class is obfuscated as `_SafeCls_4250`; the 2016 PRODUCTION build names the
 * code-2 trigger AvatarWalksOffFurni (WiredTriggerType.AVATAR_WALKS_OFF_FURNI).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/triggerconfs/_SafeCls_4250.as
 */
export class AvatarWalksOffFurni extends DefaultTriggerConf
{
    // AS3: _SafeCls_4250.as::get code()
    override get code(): number
    {
        return TriggerConfCodes.AVATAR_WALKS_OFF_FURNI;
    }
}

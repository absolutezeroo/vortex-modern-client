import {TriggerConfCodes} from './TriggerConfCodes';
import {DefaultTriggerConf} from './DefaultTriggerConf';

/**
 * AvatarWalksOnFurni — the "an avatar walks onto the furni" wired trigger. Takes no form inputs.
 *
 * Name recovered: the AS3 class is obfuscated as `_SafeCls_4108`; the 2016 PRODUCTION build names the
 * code-1 trigger AvatarWalksOnFurni (WiredTriggerType.AVATAR_WALKS_ON_FURNI).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/triggerconfs/_SafeCls_4108.as
 */
export class AvatarWalksOnFurni extends DefaultTriggerConf
{
    // AS3: _SafeCls_4108.as::get code()
    override get code(): number
    {
        return TriggerConfCodes.AVATAR_WALKS_ON_FURNI;
    }
}

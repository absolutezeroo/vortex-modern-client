import {TriggerConfCodes} from './TriggerConfCodes';
import {DefaultTriggerConf} from './DefaultTriggerConf';

/**
 * AvatarEntersRoom — the "an avatar enters the room" wired trigger. Takes no form inputs.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/triggerconfs/AvatarEntersRoom.as
 */
export class AvatarEntersRoom extends DefaultTriggerConf
{
    // AS3: AvatarEntersRoom.as::get code()
    override get code(): number
    {
        return TriggerConfCodes.AVATAR_ENTERS_ROOM;
    }
}

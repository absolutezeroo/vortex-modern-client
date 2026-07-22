import {TriggerConfCodes} from './TriggerConfCodes';
import {DefaultTriggerConf} from './DefaultTriggerConf';

/**
 * AvatarLeavesRoom — the "an avatar leaves the room" wired trigger. Takes no form inputs.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/triggerconfs/AvatarLeavesRoom.as
 */
export class AvatarLeavesRoom extends DefaultTriggerConf
{
    // AS3: AvatarLeavesRoom.as::get code()
    override get code(): number
    {
        return TriggerConfCodes.AVATAR_LEAVES_ROOM;
    }
}

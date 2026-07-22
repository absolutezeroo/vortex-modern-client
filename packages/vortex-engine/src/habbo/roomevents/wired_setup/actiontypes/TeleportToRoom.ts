import {ActionTypeCodes} from './ActionTypeCodes';
import {DefaultActionType} from './DefaultActionType';

/**
 * TeleportToRoom — the "teleport to another room" wired action.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/actiontypes/TeleportToRoom.as
 */
export class TeleportToRoom extends DefaultActionType
{
    // AS3: TeleportToRoom.as::get code()
    override get code(): number
    {
        return ActionTypeCodes.TELEPORT_TO_ROOM;
    }
}

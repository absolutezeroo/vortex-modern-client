/**
 * RoomObjectAvatarExperienceUpdateMessage
 *
 * Based on AS3: com.sulake.habbo.room.messages.RoomObjectAvatarExperienceUpdateMessage
 *
 * Update message for pet experience gain.
 */
import {RoomObjectUpdateMessage} from '@room/messages/RoomObjectUpdateMessage';

export class RoomObjectAvatarExperienceUpdateMessage extends RoomObjectUpdateMessage
{
    constructor(gainedExperience: number)
    {
        super(null, null);
        this._gainedExperience = gainedExperience;
    }

    private _gainedExperience: number;

    get gainedExperience(): number
    {
        return this._gainedExperience;
    }
}

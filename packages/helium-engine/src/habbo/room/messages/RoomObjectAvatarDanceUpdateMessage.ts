/**
 * RoomObjectAvatarDanceUpdateMessage
 *
 * Based on AS3: com.sulake.habbo.room.messages.RoomObjectAvatarDanceUpdateMessage
 *
 * Update message for avatar dance style.
 */
import {RoomObjectUpdateMessage} from '@room/messages/RoomObjectUpdateMessage';

export class RoomObjectAvatarDanceUpdateMessage extends RoomObjectUpdateMessage
{
    constructor(danceStyle: number)
    {
        super(null, null);
        this._danceStyle = danceStyle;
    }

    private _danceStyle: number;

    get danceStyle(): number
    {
        return this._danceStyle;
    }
}

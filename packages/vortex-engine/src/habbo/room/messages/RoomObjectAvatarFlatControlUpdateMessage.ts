/**
 * RoomObjectAvatarFlatControlUpdateMessage
 *
 * Based on AS3: com.sulake.habbo.room.messages.RoomObjectAvatarFlatControlUpdateMessage
 *
 * Update message for avatar flat control level (room rights).
 */
import {RoomObjectUpdateMessage} from '@room/messages/RoomObjectUpdateMessage';

export class RoomObjectAvatarFlatControlUpdateMessage extends RoomObjectUpdateMessage
{
    constructor(rawData: string)
    {
        super(null, null);
        this._rawData = rawData;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/room/messages/RoomObjectAvatarFlatControlUpdateMessage.as::_rawData
    private _rawData: string;

    // AS3: .../src/com/sulake/habbo/room/messages/RoomObjectAvatarFlatControlUpdateMessage.as::get rawData()
    get rawData(): string
    {
        return this._rawData;
    }
}

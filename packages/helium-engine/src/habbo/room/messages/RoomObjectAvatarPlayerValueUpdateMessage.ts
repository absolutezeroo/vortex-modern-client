/**
 * RoomObjectAvatarPlayerValueUpdateMessage
 *
 * Based on AS3: com.sulake.habbo.room.messages.RoomObjectAvatarPlayerValueUpdateMessage
 *
 * Update message for avatar player value (game score, etc.).
 */
import {RoomObjectUpdateMessage} from '@room/messages/RoomObjectUpdateMessage';

export class RoomObjectAvatarPlayerValueUpdateMessage extends RoomObjectUpdateMessage
{
    constructor(value: number)
    {
        super(null, null);
        this._value = value;
    }

    private _value: number;

    get value(): number
    {
        return this._value;
    }
}

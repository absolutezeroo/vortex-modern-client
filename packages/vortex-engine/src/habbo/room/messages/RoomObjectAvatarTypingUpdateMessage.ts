/**
 * RoomObjectAvatarTypingUpdateMessage
 *
 * Based on AS3: com.sulake.habbo.room.messages.RoomObjectAvatarTypingUpdateMessage
 *
 * Update message for avatar typing indicator.
 */
import {RoomObjectUpdateMessage} from '@room/messages/RoomObjectUpdateMessage';

export class RoomObjectAvatarTypingUpdateMessage extends RoomObjectUpdateMessage
{
    constructor(isTyping: boolean)
    {
        super(null, null);
        this._isTyping = isTyping;
    }

    private _isTyping: boolean;

    get isTyping(): boolean
    {
        return this._isTyping;
    }
}

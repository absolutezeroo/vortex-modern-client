/**
 * RoomObjectAvatarEffectUpdateMessage
 *
 * Based on AS3: com.sulake.habbo.room.messages.RoomObjectAvatarEffectUpdateMessage
 *
 * Update message for avatar effect (enables, etc.).
 */
import {RoomObjectUpdateMessage} from '@room/messages/RoomObjectUpdateMessage';

export class RoomObjectAvatarEffectUpdateMessage extends RoomObjectUpdateMessage
{
    constructor(effect: number, delayMilliSeconds: number = 0)
    {
        super(null, null);
        this._effect = effect;
        this._delayMilliSeconds = delayMilliSeconds;
    }

    private _effect: number;

    get effect(): number
    {
        return this._effect;
    }

    private _delayMilliSeconds: number;

    get delayMilliSeconds(): number
    {
        return this._delayMilliSeconds;
    }
}

/**
 * RoomObjectAvatarPlayingGameMessage
 *
 * Based on AS3: com.sulake.habbo.room.messages.RoomObjectAvatarPlayingGameMessage
 *
 * Update message for avatar playing game state.
 */
import {RoomObjectUpdateMessage} from '@room/messages/RoomObjectUpdateMessage';

export class RoomObjectAvatarPlayingGameMessage extends RoomObjectUpdateMessage
{
    constructor(isPlayingGame: boolean)
    {
        super(null, null);
        this._isPlayingGame = isPlayingGame;
    }

    private _isPlayingGame: boolean;

    get isPlayingGame(): boolean
    {
        return this._isPlayingGame;
    }
}

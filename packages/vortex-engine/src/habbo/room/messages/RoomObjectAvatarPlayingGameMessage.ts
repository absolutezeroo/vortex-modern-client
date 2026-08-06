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

    // AS3: .../src/com/sulake/habbo/room/messages/RoomObjectAvatarPlayingGameMessage.as::_isPlayingGame
    private _isPlayingGame: boolean;

    // AS3: .../src/com/sulake/habbo/room/messages/RoomObjectAvatarPlayingGameMessage.as::get isPlayingGame()
    get isPlayingGame(): boolean
    {
        return this._isPlayingGame;
    }
}

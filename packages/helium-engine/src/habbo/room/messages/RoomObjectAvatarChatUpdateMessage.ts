/**
 * RoomObjectAvatarChatUpdateMessage
 *
 * Based on AS3: com.sulake.habbo.room.messages.RoomObjectAvatarChatUpdateMessage
 *
 * Update message for avatar chat (triggers talk animation).
 */
import {RoomObjectUpdateMessage} from '@room/messages/RoomObjectUpdateMessage';

export class RoomObjectAvatarChatUpdateMessage extends RoomObjectUpdateMessage
{
	constructor(numberOfWords: number)
	{
		super(null, null);
		this._numberOfWords = numberOfWords;
	}

	private _numberOfWords: number;

	get numberOfWords(): number
	{
		return this._numberOfWords;
	}
}

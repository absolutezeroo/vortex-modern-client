/**
 * RoomObjectAvatarMutedUpdateMessage
 *
 * Based on AS3: com.sulake.habbo.room.messages.RoomObjectAvatarMutedUpdateMessage
 *
 * Update message for avatar muted state.
 */
import {RoomObjectUpdateMessage} from '@room/messages/RoomObjectUpdateMessage';

export class RoomObjectAvatarMutedUpdateMessage extends RoomObjectUpdateMessage
{
	constructor(isMuted: boolean)
	{
		super(null, null);
		this._isMuted = isMuted;
	}

	private _isMuted: boolean;

	get isMuted(): boolean
	{
		return this._isMuted;
	}
}

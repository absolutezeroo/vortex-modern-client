/**
 * RoomObjectAvatarSignUpdateMessage
 *
 * Based on AS3: com.sulake.habbo.room.messages.RoomObjectAvatarSignUpdateMessage
 *
 * Update message for avatar holding a sign.
 */
import {RoomObjectUpdateMessage} from '@room/messages/RoomObjectUpdateMessage';

export class RoomObjectAvatarSignUpdateMessage extends RoomObjectUpdateMessage
{
	constructor(signType: number)
	{
		super(null, null);
		this._signType = signType;
	}

	private _signType: number;

	get signType(): number
	{
		return this._signType;
	}
}

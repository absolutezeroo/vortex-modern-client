/**
 * RoomObjectAvatarPetGestureUpdateMessage
 *
 * Based on AS3: com.sulake.habbo.room.messages.RoomObjectAvatarPetGestureUpdateMessage
 *
 * Update message for pet gesture.
 */
import {RoomObjectUpdateMessage} from '@room/messages/RoomObjectUpdateMessage';

export class RoomObjectAvatarPetGestureUpdateMessage extends RoomObjectUpdateMessage
{
	constructor(gesture: string)
	{
		super(null, null);
		this._gesture = gesture;
	}

	private _gesture: string;

	get gesture(): string
	{
		return this._gesture;
	}
}

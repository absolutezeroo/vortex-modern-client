/**
 * RoomObjectAvatarSleepUpdateMessage
 *
 * Based on AS3: com.sulake.habbo.room.messages.RoomObjectAvatarSleepUpdateMessage
 *
 * Update message for avatar sleep state.
 */
import {RoomObjectUpdateMessage} from '@room/messages/RoomObjectUpdateMessage';

export class RoomObjectAvatarSleepUpdateMessage extends RoomObjectUpdateMessage
{
	constructor(isSleeping: boolean)
	{
		super(null, null);
		this._isSleeping = isSleeping;
	}

	private _isSleeping: boolean;

	get isSleeping(): boolean
	{
		return this._isSleeping;
	}
}

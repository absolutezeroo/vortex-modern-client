/**
 * RoomObjectAvatarGuideStatusUpdateMessage
 *
 * Based on AS3: com.sulake.habbo.room.messages.RoomObjectAvatarGuideStatusUpdateMessage
 *
 * Update message for avatar guide status.
 */
import {RoomObjectUpdateMessage} from '@room/messages/RoomObjectUpdateMessage';

export class RoomObjectAvatarGuideStatusUpdateMessage extends RoomObjectUpdateMessage
{
	constructor(guideStatus: number)
	{
		super(null, null);
		this._guideStatus = guideStatus;
	}

	private _guideStatus: number;

	get guideStatus(): number
	{
		return this._guideStatus;
	}
}

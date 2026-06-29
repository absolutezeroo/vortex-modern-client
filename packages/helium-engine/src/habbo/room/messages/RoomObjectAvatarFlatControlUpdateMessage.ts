/**
 * RoomObjectAvatarFlatControlUpdateMessage
 *
 * Based on AS3: com.sulake.habbo.room.messages.RoomObjectAvatarFlatControlUpdateMessage
 *
 * Update message for avatar flat control level (room rights).
 */
import {RoomObjectUpdateMessage} from '@room/messages/RoomObjectUpdateMessage';

export class RoomObjectAvatarFlatControlUpdateMessage extends RoomObjectUpdateMessage
{
	constructor(rawData: string)
	{
		super(null, null);
		this._rawData = rawData;
	}

	private _rawData: string;

	get rawData(): string
	{
		return this._rawData;
	}
}

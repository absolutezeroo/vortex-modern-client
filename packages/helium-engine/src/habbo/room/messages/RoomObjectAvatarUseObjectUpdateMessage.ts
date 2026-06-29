/**
 * RoomObjectAvatarUseObjectUpdateMessage
 *
 * Based on AS3: com.sulake.habbo.room.messages.RoomObjectAvatarUseObjectUpdateMessage
 *
 * Update message for avatar using a carried object.
 */
import {RoomObjectUpdateMessage} from '@room/messages/RoomObjectUpdateMessage';

export class RoomObjectAvatarUseObjectUpdateMessage extends RoomObjectUpdateMessage
{
	constructor(itemType: number)
	{
		super(null, null);
		this._itemType = itemType;
	}

	private _itemType: number;

	get itemType(): number
	{
		return this._itemType;
	}
}

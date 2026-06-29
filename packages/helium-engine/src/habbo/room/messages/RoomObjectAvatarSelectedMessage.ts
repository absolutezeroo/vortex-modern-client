/**
 * RoomObjectAvatarSelectedMessage
 *
 * Based on AS3: com.sulake.habbo.room.messages.RoomObjectAvatarSelectedMessage
 *
 * Update message for avatar selection state.
 */
import {RoomObjectUpdateMessage} from '@room/messages/RoomObjectUpdateMessage';

export class RoomObjectAvatarSelectedMessage extends RoomObjectUpdateMessage
{
	constructor(selected: boolean)
	{
		super(null, null);
		this._selected = selected;
	}

	private _selected: boolean;

	get selected(): boolean
	{
		return this._selected;
	}
}

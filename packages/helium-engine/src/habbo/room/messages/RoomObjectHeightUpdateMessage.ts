/**
 * RoomObjectHeightUpdateMessage
 *
 * Based on AS3: com.sulake.habbo.room.messages.RoomObjectHeightUpdateMessage
 *
 * Update message for furniture height changes.
 */
import {RoomObjectUpdateMessage} from '@room/messages/RoomObjectUpdateMessage';
import type {IVector3d} from '@room/utils/IVector3d';

export class RoomObjectHeightUpdateMessage extends RoomObjectUpdateMessage
{
	constructor(location: IVector3d | null, direction: IVector3d | null, height: number)
	{
		super(location, direction);
		this._height = height;
	}

	private _height: number;

	get height(): number
	{
		return this._height;
	}
}

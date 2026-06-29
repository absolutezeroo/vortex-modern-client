/**
 * RoomObjectAvatarUpdateMessage
 *
 * Based on AS3: com.sulake.habbo.room.messages.RoomObjectAvatarUpdateMessage
 *
 * Update message for avatar with head direction and vertical offset.
 */
import {RoomObjectMoveUpdateMessage} from './RoomObjectMoveUpdateMessage';
import type {IVector3d} from '@room/utils/IVector3d';

export class RoomObjectAvatarUpdateMessage extends RoomObjectMoveUpdateMessage
{
	constructor(
		location: IVector3d | null,
		targetLocation: IVector3d | null,
		direction: IVector3d | null,
		dirHead: number,
		canStandUp: boolean,
		baseY: number,
		animationTime: number = NaN,
		skipPositionUpdate: boolean = false
	)
	{
		super(location, targetLocation, direction, animationTime, false, skipPositionUpdate);
		this._dirHead = dirHead;
		this._canStandUp = canStandUp;
		this._baseY = baseY;
	}

	private _dirHead: number;

	get dirHead(): number
	{
		return this._dirHead;
	}

	private _canStandUp: boolean;

	get canStandUp(): boolean
	{
		return this._canStandUp;
	}

	private _baseY: number;

	get baseY(): number
	{
		return this._baseY;
	}
}

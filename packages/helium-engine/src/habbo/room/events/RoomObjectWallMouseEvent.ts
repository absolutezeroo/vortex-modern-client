/**
 * RoomObjectWallMouseEvent
 *
 * @see source_as_win63/habbo/room/events/RoomObjectWallMouseEvent.as
 *
 * Mouse event for wall interactions with wall geometry.
 */
import {RoomObjectMouseEvent} from '@room/events/RoomObjectMouseEvent';
import type {IRoomObject} from '@room/object/IRoomObject';
import type {IVector3d} from '@room/utils/IVector3d';
import {Vector3d} from '@room/utils/Vector3d';

export class RoomObjectWallMouseEvent extends RoomObjectMouseEvent
{
	constructor(
		type: string,
		object: IRoomObject | null,
		eventId: string,
		wallLocation: IVector3d,
		wallWidth: IVector3d,
		wallHeight: IVector3d,
		x: number,
		y: number,
		direction: number,
		altKey: boolean = false,
		ctrlKey: boolean = false,
		shiftKey: boolean = false,
		buttonDown: boolean = false
	)
	{
		super(type, object, eventId, altKey, ctrlKey, shiftKey, buttonDown);
		this._wallLocation = new Vector3d();
		this._wallLocation.assign(wallLocation);
		this._wallWidth = new Vector3d();
		this._wallWidth.assign(wallWidth);
		this._wallHeight = new Vector3d();
		this._wallHeight.assign(wallHeight);
		this._x = x;
		this._y = y;
		this._direction = direction;
	}

	private _wallLocation: Vector3d;

	get wallLocation(): IVector3d
	{
		return this._wallLocation;
	}

	private _wallWidth: Vector3d;

	get wallWidth(): IVector3d
	{
		return this._wallWidth;
	}

	private _wallHeight: Vector3d;

	get wallHeight(): IVector3d
	{
		return this._wallHeight;
	}

	private _x: number;

	get x(): number
	{
		return this._x;
	}

	private _y: number;

	get y(): number
	{
		return this._y;
	}

	private _direction: number;

	get direction(): number
	{
		return this._direction;
	}
}

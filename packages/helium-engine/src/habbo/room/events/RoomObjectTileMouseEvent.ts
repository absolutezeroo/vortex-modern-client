/**
 * RoomObjectTileMouseEvent
 *
 * @see source_as_win63/habbo/room/events/RoomObjectTileMouseEvent.as
 *
 * Mouse event for tile interactions with tile coordinates.
 */
import {RoomObjectMouseEvent} from '@room/events/RoomObjectMouseEvent';
import type {IRoomObject} from '@room/object/IRoomObject';

export class RoomObjectTileMouseEvent extends RoomObjectMouseEvent
{
	constructor(
		type: string,
		object: IRoomObject | null,
		eventId: string,
		tileX: number,
		tileY: number,
		tileZ: number,
		altKey: boolean = false,
		ctrlKey: boolean = false,
		shiftKey: boolean = false,
		buttonDown: boolean = false
	)
	{
		super(type, object, eventId, altKey, ctrlKey, shiftKey, buttonDown);
		this._tileX = tileX;
		this._tileY = tileY;
		this._tileZ = tileZ;
	}

	private _tileX: number;

	get tileX(): number
	{
		return this._tileX;
	}

	private _tileY: number;

	get tileY(): number
	{
		return this._tileY;
	}

	private _tileZ: number;

	get tileZ(): number
	{
		return this._tileZ;
	}

	get tileXAsInt(): number
	{
		return Math.trunc(this._tileX + 0.499);
	}

	get tileYAsInt(): number
	{
		return Math.trunc(this._tileY + 0.499);
	}

	get tileZAsInt(): number
	{
		return Math.trunc(this._tileZ + 0.499);
	}
}

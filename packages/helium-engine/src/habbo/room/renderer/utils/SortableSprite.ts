/**
 * SortableSprite
 *
 * Based on AS3: com.sulake.room.renderer.utils.SortableSprite
 *
 * Holds sprite data and z-order for sorting during canvas rendering.
 * The canvas builds a flat list of SortableSprites each frame,
 * sorts by z descending, then maps to ExtendedSprite display children.
 *
 * @see sources/flash_version/com/sulake/room/renderer/utils/SortableSprite.as
 */
import type {IRoomObjectSprite} from '@room/object/visualization/IRoomObjectSprite';

export class SortableSprite
{
	public static readonly Z_INFINITY: number = 100000000;

	public name: string = '';

	private _x: number = 0;

	get x(): number
	{
		return this._x;
	}

	set x(value: number)
	{
		this._x = value;
	}

	private _y: number = 0;

	get y(): number
	{
		return this._y;
	}

	set y(value: number)
	{
		this._y = value;
	}

	private _z: number = 0;

	get z(): number
	{
		return this._z;
	}

	set z(value: number)
	{
		this._z = value;
	}

	private _sprite: IRoomObjectSprite | null = null;

	get sprite(): IRoomObjectSprite | null
	{
		return this._sprite;
	}

	set sprite(value: IRoomObjectSprite | null)
	{
		this._sprite = value;
	}

	dispose(): void
	{
		this._sprite = null;
		this._z = -(SortableSprite.Z_INFINITY);
	}
}

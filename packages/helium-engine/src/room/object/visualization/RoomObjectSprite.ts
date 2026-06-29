/**
 * RoomObjectSprite
 *
 * Based on AS3: com.sulake.room.object.visualization.RoomObjectSprite
 *
 * Represents a single visual sprite element in a room object visualization.
 * Tracks property changes via updateId for efficient rendering.
 */
import type {Texture} from 'pixi.js';
import type {IRoomObjectSprite} from './IRoomObjectSprite';
import {RoomObjectSpriteType} from '../enum/RoomObjectSpriteType';

let spriteInstanceCounter = 0;

export class RoomObjectSprite implements IRoomObjectSprite
{
	constructor()
	{
		this._instanceId = spriteInstanceCounter++;
	}

	private _texture: Texture | null = null;

	// Texture
	get texture(): Texture | null
	{
		return this._texture;
	}

	set texture(value: Texture | null)
	{
		if (value === this._texture)
		{
			return;
		}

		if (value !== null)
		{
			this._width = value.width;
			this._height = value.height;
		}

		this._texture = value;
		this._updateId++;
	}

	private _assetName: string = '';

	// Asset name
	get assetName(): string
	{
		return this._assetName;
	}

	set assetName(value: string)
	{
		if (value === this._assetName)
		{
			return;
		}

		this._assetName = value;
		this._updateId++;
	}

	private _libraryAssetName: string = '';

	// Library asset name
	get libraryAssetName(): string
	{
		return this._libraryAssetName;
	}

	set libraryAssetName(value: string)
	{
		this._libraryAssetName = value;
	}

	private _assetPosture: string | null = null;

	// Asset posture
	get assetPosture(): string | null
	{
		return this._assetPosture;
	}

	set assetPosture(value: string | null)
	{
		this._assetPosture = value;
	}

	private _assetGesture: string | null = null;

	// Asset gesture
	get assetGesture(): string | null
	{
		return this._assetGesture;
	}

	set assetGesture(value: string | null)
	{
		this._assetGesture = value;
	}

	private _visible: boolean = true;

	// Visible
	get visible(): boolean
	{
		return this._visible;
	}

	set visible(value: boolean)
	{
		if (value === this._visible)
		{
			return;
		}

		this._visible = value;
		this._updateId++;
	}

	private _tag: string = '';

	// Tag
	get tag(): string
	{
		return this._tag;
	}

	set tag(value: string)
	{
		if (value === this._tag)
		{
			return;
		}

		this._tag = value;
		this._updateId++;
	}

	private _alpha: number = 255;

	// Alpha
	get alpha(): number
	{
		return this._alpha;
	}

	set alpha(value: number)
	{
		value = value & 255;

		if (value === this._alpha)
		{
			return;
		}

		this._alpha = value;
		this._updateId++;
	}

	private _color: number = 0xFFFFFF;

	// Color
	get color(): number
	{
		return this._color;
	}

	set color(value: number)
	{
		value = value & 0xFFFFFF;

		if (value === this._color)
		{
			return;
		}

		this._color = value;
		this._updateId++;
	}

	private _blendMode: string = 'normal';

	// Blend mode
	get blendMode(): string
	{
		return this._blendMode;
	}

	set blendMode(value: string)
	{
		if (value === this._blendMode)
		{
			return;
		}

		this._blendMode = value;
		this._updateId++;
	}

	private _flipH: boolean = false;

	// Flip H
	get flipH(): boolean
	{
		return this._flipH;
	}

	set flipH(value: boolean)
	{
		if (value === this._flipH)
		{
			return;
		}

		this._flipH = value;
		this._updateId++;
	}

	private _flipV: boolean = false;

	// Flip V
	get flipV(): boolean
	{
		return this._flipV;
	}

	set flipV(value: boolean)
	{
		if (value === this._flipV)
		{
			return;
		}

		this._flipV = value;
		this._updateId++;
	}

	private _direction: number = 0;

	// Direction
	get direction(): number
	{
		return this._direction;
	}

	set direction(value: number)
	{
		this._direction = value;
	}

	private _offsetX: number = 0;

	// Offset X
	get offsetX(): number
	{
		return this._offsetX;
	}

	set offsetX(value: number)
	{
		if (value === this._offsetX)
		{
			return;
		}

		this._offsetX = value;
		this._updateId++;
	}

	private _offsetY: number = 0;

	// Offset Y
	get offsetY(): number
	{
		return this._offsetY;
	}

	set offsetY(value: number)
	{
		if (value === this._offsetY)
		{
			return;
		}

		this._offsetY = value;
		this._updateId++;
	}

	private _width: number = 0;

	// Width (read-only)
	get width(): number
	{
		return this._width;
	}

	private _height: number = 0;

	// Height (read-only)
	get height(): number
	{
		return this._height;
	}

	private _relativeDepth: number = 0;

	// Relative depth
	get relativeDepth(): number
	{
		return this._relativeDepth;
	}

	set relativeDepth(value: number)
	{
		if (value === this._relativeDepth)
		{
			return;
		}

		this._relativeDepth = value;
		this._updateId++;
	}

	private _varyingDepth: boolean = false;

	// Varying depth
	get varyingDepth(): boolean
	{
		return this._varyingDepth;
	}

	set varyingDepth(value: boolean)
	{
		if (value === this._varyingDepth)
		{
			return;
		}

		this._varyingDepth = value;
		this._updateId++;
	}

	private _alphaTolerance: number = 128;

	// Alpha tolerance
	get alphaTolerance(): number
	{
		return this._alphaTolerance;
	}

	set alphaTolerance(value: number)
	{
		if (value === this._alphaTolerance)
		{
			return;
		}

		this._alphaTolerance = value;
		this._updateId++;
	}

	private _clickHandling: boolean = false;

	// Click handling
	get clickHandling(): boolean
	{
		return this._clickHandling;
	}

	set clickHandling(value: boolean)
	{
		if (value === this._clickHandling)
		{
			return;
		}

		this._clickHandling = value;
		this._updateId++;
	}

	private _skipMouseHandling: boolean = false;

	// Skip mouse handling
	get skipMouseHandling(): boolean
	{
		return this._skipMouseHandling;
	}

	set skipMouseHandling(value: boolean)
	{
		this._skipMouseHandling = value;
	}

	private _updateId: number = 0;

	// Update ID (read-only)
	get updateId(): number
	{
		return this._updateId;
	}

	private _filters: unknown[] | null = null;

	// Filters
	get filters(): unknown[] | null
	{
		return this._filters;
	}

	set filters(value: unknown[] | null)
	{
		if (value === this._filters)
		{
			return;
		}

		this._filters = value;
		this._updateId++;
	}

	protected _spriteType: number = RoomObjectSpriteType.DEFAULT;

	// Sprite type
	get spriteType(): number
	{
		return this._spriteType;
	}

	set spriteType(value: number)
	{
		this._spriteType = value;
	}

	private _objectType: string | null = null;

	// Object type
	get objectType(): string | null
	{
		return this._objectType;
	}

	set objectType(value: string | null)
	{
		this._objectType = value;
	}

	private _instanceId: number;

	// Instance ID (read-only)
	get instanceId(): number
	{
		return this._instanceId;
	}

	private _planeId: number = 0;

	// Plane ID
	get planeId(): number
	{
		return this._planeId;
	}

	set planeId(value: number)
	{
		this._planeId = value;
	}

	dispose(): void
	{
		this._texture = null;
		this._width = 0;
		this._height = 0;
	}
}

/**
 * LayerData
 *
 * @see com.sulake.habbo.room.object.visualization.data.class_3646
 *
 * Per-layer visualization properties: tag, ink, alpha, offsets, ignoreMouse.
 */
export class LayerData
{
	public static readonly DEFAULT_TAG: string = '';
	public static readonly DEFAULT_INK: number = 0;
	public static readonly DEFAULT_ALPHA: number = 255;
	public static readonly DEFAULT_IGNORE_MOUSE: boolean = false;
	public static readonly DEFAULT_X_OFFSET: number = 0;
	public static readonly DEFAULT_Y_OFFSET: number = 0;
	public static readonly DEFAULT_Z_OFFSET: number = 0;

	public static readonly INK_ADD: number = 1;
	public static readonly INK_SUBTRACT: number = 2;
	public static readonly INK_DARKEN: number = 3;
	public static readonly INK_DIFFERENCE: number = 4;
	public static readonly INK_MULTIPLY: number = 5;
	public static readonly INK_INVERT: number = 6;
	public static readonly INK_SCREEN: number = 7;

	private _tag: string = '';

	get tag(): string
	{
		return this._tag;
	}

	set tag(value: string)
	{
		this._tag = value;
	}

	private _ink: number = 0;

	get ink(): number
	{
		return this._ink;
	}

	set ink(value: number)
	{
		this._ink = value;
	}

	private _alpha: number = 255;

	get alpha(): number
	{
		return this._alpha;
	}

	set alpha(value: number)
	{
		this._alpha = value;
	}

	private _ignoreMouse: boolean = false;

	get ignoreMouse(): boolean
	{
		return this._ignoreMouse;
	}

	set ignoreMouse(value: boolean)
	{
		this._ignoreMouse = value;
	}

	private _xOffset: number = 0;

	get xOffset(): number
	{
		return this._xOffset;
	}

	set xOffset(value: number)
	{
		this._xOffset = value;
	}

	private _yOffset: number = 0;

	get yOffset(): number
	{
		return this._yOffset;
	}

	set yOffset(value: number)
	{
		this._yOffset = value;
	}

	private _zOffset: number = 0;

	get zOffset(): number
	{
		return this._zOffset;
	}

	set zOffset(value: number)
	{
		this._zOffset = value;
	}

	copyValues(other: LayerData): void
	{
		if (other !== null)
		{
			this._tag = other.tag;
			this._ink = other.ink;
			this._alpha = other.alpha;
			this._ignoreMouse = other.ignoreMouse;
			this._xOffset = other.xOffset;
			this._yOffset = other.yOffset;
			this._zOffset = other.zOffset;
		}
	}
}

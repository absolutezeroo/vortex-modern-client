import type {IPartColor} from './IPartColor';

/**
 * Represents a color entry parsed from a palette in figure data JSON.
 *
 * @see sources/win63_version/habbo/avatar/structure/figure/PartColor.as
 */
export class PartColor implements IPartColor
{
	constructor(data: any)
	{
		this._id = parseInt(data.id) || 0;
		this._index = parseInt(data.index) || 0;
		this._clubLevel = parseInt(data.club) || 0;
		this._isSelectable = Boolean(typeof data.selectable === 'boolean' ? data.selectable : parseInt(data.selectable));

		// Nitro format: data.hexCode, XML-JSON format: data.color
		const colorHex: string = String(data.hexCode || data.color || '0');
		this._rgb = parseInt(colorHex, 16);
		this._r = (this._rgb >> 16) & 0xFF;
		this._g = (this._rgb >> 8) & 0xFF;
		this._b = this._rgb & 0xFF;
		this._redMultiplier = (this._r / 255) * 1;
		this._greenMultiplier = (this._g / 255) * 1;
		this._blueMultiplier = (this._b / 255) * 1;
		this._colorTransform = {
			redMultiplier: this._redMultiplier,
			greenMultiplier: this._greenMultiplier,
			blueMultiplier: this._blueMultiplier
		};
	}

	private _id: number;

	public get id(): number
	{
		return this._id;
	}

	private _index: number;

	public get index(): number
	{
		return this._index;
	}

	private _clubLevel: number;

	public get clubLevel(): number
	{
		return this._clubLevel;
	}

	private _isSelectable: boolean;

	public get isSelectable(): boolean
	{
		return this._isSelectable;
	}

	private _rgb: number;

	public get rgb(): number
	{
		return this._rgb;
	}

	private _r: number;

	public get r(): number
	{
		return this._r;
	}

	private _g: number;

	public get g(): number
	{
		return this._g;
	}

	private _b: number;

	public get b(): number
	{
		return this._b;
	}

	private _redMultiplier: number;

	public get redMultiplier(): number
	{
		return this._redMultiplier;
	}

	private _greenMultiplier: number;

	public get greenMultiplier(): number
	{
		return this._greenMultiplier;
	}

	private _blueMultiplier: number;

	public get blueMultiplier(): number
	{
		return this._blueMultiplier;
	}

	private _colorTransform: { redMultiplier: number; greenMultiplier: number; blueMultiplier: number };

	public get colorTransform(): { redMultiplier: number; greenMultiplier: number; blueMultiplier: number }
	{
		return this._colorTransform;
	}
}

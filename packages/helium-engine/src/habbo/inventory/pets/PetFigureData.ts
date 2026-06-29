/**
 * Pet figure/appearance data
 *
 * Based on AS3 com.sulake.habbo.communication.messages.parser.inventory.pets.class_1657
 */
export class PetFigureData
{
	constructor(
		typeId: number,
		paletteId: number,
		color: string,
		breedId: number,
		customPartCount: number,
		customParts: number[]
	)
	{
		this._typeId = typeId;
		this._paletteId = paletteId;
		this._color = color;
		this._breedId = breedId;
		this._customPartCount = customPartCount;
		this._customParts = customParts;
	}

	private _typeId: number;

	get typeId(): number
	{
		return this._typeId;
	}

	private _paletteId: number;

	get paletteId(): number
	{
		return this._paletteId;
	}

	private _color: string;

	get color(): string
	{
		return this._color;
	}

	private _breedId: number;

	get breedId(): number
	{
		return this._breedId;
	}

	private _customPartCount: number;

	get customPartCount(): number
	{
		return this._customPartCount;
	}

	private _customParts: number[];

	get customParts(): number[]
	{
		return this._customParts;
	}

	/**
	 * Generate figure string for rendering
	 */
	get figureString(): string
	{
		let result = `${this._typeId} ${this._paletteId} ${this._color}`;

		result += ` ${this._customPartCount}`;

		for (const part of this._customParts)
		{
			result += ` ${part}`;
		}

		return result;
	}
}

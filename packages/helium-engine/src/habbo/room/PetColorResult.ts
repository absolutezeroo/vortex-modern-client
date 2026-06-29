/**
 * PetColorResult
 *
 * Holds the color information for a pet breed/palette.
 *
 * @see sources/win63_version/habbo/room/PetColorResult.as
 */
export class PetColorResult
{
	private static readonly COLOR_TAGS: string[] = [
		'Null', 'Black', 'White', 'Grey', 'Red', 'Orange', 'Pink',
		'Green', 'Lime', 'Blue', 'Light-Blue', 'Dark-Blue', 'Yellow',
		'Brown', 'Dark-Brown', 'Beige', 'Cyan', 'Purple', 'Gold'
	];

	constructor(primaryColor: number, secondaryColor: number, breed: number, colorTag: number, id: string, isMaster: boolean, layerTags: string[])
	{
		this._primaryColor = primaryColor & 0xFFFFFF;
		this._secondaryColor = secondaryColor & 0xFFFFFF;
		this._breed = breed;
		this._tag = (colorTag > -1 && colorTag < PetColorResult.COLOR_TAGS.length)
			? PetColorResult.COLOR_TAGS[colorTag]
			: '';
		this._id = id;
		this._isMaster = isMaster;
		this._layerTags = layerTags;
	}

	private _primaryColor: number;

	get primaryColor(): number
	{
		return this._primaryColor;
	}

	private _secondaryColor: number;

	get secondaryColor(): number
	{
		return this._secondaryColor;
	}

	private _breed: number;

	get breed(): number
	{
		return this._breed;
	}

	private _tag: string;

	get tag(): string
	{
		return this._tag;
	}

	private _id: string;

	get id(): string
	{
		return this._id;
	}

	private _isMaster: boolean;

	get isMaster(): boolean
	{
		return this._isMaster;
	}

	private _layerTags: string[];

	get layerTags(): string[]
	{
		return this._layerTags;
	}
}

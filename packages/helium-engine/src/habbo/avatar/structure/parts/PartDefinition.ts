/**
 * Defines the relationship between a body part and its set types,
 * including flipping and removal mappings.
 *
 * @see sources/win63_version/habbo/avatar/structure/parts/PartDefinition.as
 */
export class PartDefinition
{
	constructor(data: any)
	{
		// Nitro: camelCase (setType), XML-JSON: hyphenated (set-type)
		this._setType = String(data.setType ?? data['set-type'] ?? '');
		this._flippedSetType = String(data.flippedSetType ?? data['flipped-set-type'] ?? '');
		this._removeSetType = String(data.removeSetType ?? data['remove-set-type'] ?? '');
		this._appendToFigure = false;
		this._staticId = -1;
	}

	private _setType: string;

	public get setType(): string
	{
		return this._setType;
	}

	private _flippedSetType: string;

	public get flippedSetType(): string
	{
		return this._flippedSetType;
	}

	public set flippedSetType(value: string)
	{
		this._flippedSetType = value;
	}

	private _removeSetType: string;

	public get removeSetType(): string
	{
		return this._removeSetType;
	}

	private _appendToFigure: boolean;

	public get appendToFigure(): boolean
	{
		return this._appendToFigure;
	}

	public set appendToFigure(value: boolean)
	{
		this._appendToFigure = value;
	}

	private _staticId: number;

	public get staticId(): number
	{
		return this._staticId;
	}

	public set staticId(value: number)
	{
		this._staticId = value;
	}

	/**
	 * Checks whether this part definition has a static id assigned.
	 *
	 * @returns True if a static id has been set
	 */
	public hasStaticId(): boolean
	{
		return this._staticId >= 0;
	}
}

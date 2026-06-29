/**
 * Represents an asset alias mapping one asset name to another, with optional flipping.
 * Parsed from JSON with properties: name, link, fliph, flipv.
 *
 * @see sources/win63_version/habbo/avatar/alias/AssetAlias.as
 */
export class AssetAlias
{
	constructor(data: any)
	{
		this._name = String(data.name ?? '');
		this._link = String(data.link ?? '');
		this._flipH = Boolean(parseInt(data.fliph));
		this._flipV = Boolean(parseInt(data.flipv));
	}

	private _name: string;

	/**
	 * The alias name.
	 */
	public get name(): string
	{
		return this._name;
	}

	private _link: string;

	/**
	 * The linked asset name this alias points to.
	 */
	public get link(): string
	{
		return this._link;
	}

	private _flipH: boolean;

	/**
	 * Whether the asset should be flipped horizontally.
	 */
	public get flipH(): boolean
	{
		return this._flipH;
	}

	private _flipV: boolean;

	/**
	 * Whether the asset should be flipped vertically.
	 */
	public get flipV(): boolean
	{
		return this._flipV;
	}
}

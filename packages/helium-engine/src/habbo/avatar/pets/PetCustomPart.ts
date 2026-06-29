/**
 * Custom part data for a pet figure.
 *
 * @see sources/win63_version/habbo/avatar/pets/PetCustomPart.as
 */
export class PetCustomPart
{
	constructor(layerId: number, partId: number, paletteId: number)
	{
		this._layerId = layerId;
		this._partId = partId;
		this._paletteId = paletteId;
	}

	private _layerId: number;

	public get layerId(): number
	{
		return this._layerId;
	}

	public set layerId(value: number)
	{
		this._layerId = value;
	}

	private _partId: number;

	public get partId(): number
	{
		return this._partId;
	}

	public set partId(value: number)
	{
		this._partId = value;
	}

	private _paletteId: number;

	public get paletteId(): number
	{
		return this._paletteId;
	}

	public set paletteId(value: number)
	{
		this._paletteId = value;
	}
}

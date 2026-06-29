import type {IFigurePart} from './IFigurePart';

/**
 * Represents a single figure part parsed from figure data JSON.
 *
 * @see sources/win63_version/habbo/avatar/structure/figure/FigurePart.as
 */
export class FigurePart implements IFigurePart
{
	constructor(data: any)
	{
		this._id = parseInt(data.id) || 0;
		this._type = String(data.type || '');
		this._index = parseInt(data.index) || 0;
		this._colorLayerIndex = parseInt(data.colorindex) || 0;

		const breed: string = String(data.breed ?? '');
		this._breed = (breed !== '') ? parseInt(breed) : -1;

		const paletteMapId: string = String(data.palettemapid ?? '');
		this._paletteMap = (paletteMapId !== '') ? parseInt(paletteMapId) : -1;
	}

	private _id: number;

	public get id(): number
	{
		return this._id;
	}

	private _type: string;

	public get type(): string
	{
		return this._type;
	}

	private _breed: number;

	public get breed(): number
	{
		return this._breed;
	}

	private _colorLayerIndex: number;

	public get colorLayerIndex(): number
	{
		return this._colorLayerIndex;
	}

	private _index: number;

	public get index(): number
	{
		return this._index;
	}

	private _paletteMap: number;

	public get paletteMap(): number
	{
		return this._paletteMap;
	}

	public dispose(): void
	{
	}
}

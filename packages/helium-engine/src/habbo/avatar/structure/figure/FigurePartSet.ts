import type {IFigurePart} from './IFigurePart';
import type {IFigurePartSet} from './IFigurePartSet';
import {FigurePart} from './FigurePart';

/**
 * Represents a set of figure parts parsed from figure data JSON.
 *
 * @see sources/win63_version/habbo/avatar/structure/figure/FigurePartSet.as
 */
export class FigurePartSet implements IFigurePartSet
{
	constructor(data: any, type: string)
	{
		this._type = type;
		this._id = parseInt(data.id) || 0;
		this._gender = String(data.gender || '');
		this._clubLevel = parseInt(data.club) || 0;
		this._isColorable = Boolean(typeof data.colorable === 'boolean' ? data.colorable : parseInt(data.colorable));
		this._isSelectable = Boolean(typeof data.selectable === 'boolean' ? data.selectable : parseInt(data.selectable));
		this._isPreSelectable = Boolean(typeof data.preselectable === 'boolean' ? data.preselectable : parseInt(data.preselectable));
		this._isSellable = Boolean(typeof data.sellable === 'boolean' ? data.sellable : parseInt(data.sellable));
		this._parts = [];
		this._hiddenLayers = [];

		// Nitro format: data.parts, XML-JSON format: data.part or data.parts.part
		const rawParts = data.parts?.part || data.parts || data.part;

		if (rawParts)
		{
			const parts: any[] = Array.isArray(rawParts) ? rawParts : [rawParts];

			for (const partData of parts)
			{
				const figurePart = new FigurePart(partData);
				const insertIndex = this._indexOfPartType(figurePart);

				if (insertIndex !== -1)
				{
					this._parts.splice(insertIndex, 0, figurePart);
				}
				else
				{
					this._parts.push(figurePart);
				}
			}
		}

		// Nitro format: data.hiddenLayers (array of {partType}), XML-JSON format: data.hiddenlayers.layer (array of {parttype})
		if (data.hiddenLayers)
		{
			const layers: any[] = Array.isArray(data.hiddenLayers) ? data.hiddenLayers : [data.hiddenLayers];

			for (const layer of layers)
			{
				this._hiddenLayers.push(String(layer.partType || layer.parttype));
			}
		}
		else if (data.hiddenlayers && data.hiddenlayers.layer)
		{
			const layers: any[] = Array.isArray(data.hiddenlayers.layer)
				? data.hiddenlayers.layer
				: [data.hiddenlayers.layer];

			for (const layer of layers)
			{
				this._hiddenLayers.push(String(layer.parttype));
			}
		}
	}

	private _type: string;

	public get type(): string
	{
		return this._type;
	}

	private _id: number;

	public get id(): number
	{
		return this._id;
	}

	private _gender: string;

	public get gender(): string
	{
		return this._gender;
	}

	private _clubLevel: number;

	public get clubLevel(): number
	{
		return this._clubLevel;
	}

	private _isColorable: boolean;

	public get isColorable(): boolean
	{
		return this._isColorable;
	}

	private _isSelectable: boolean;

	public get isSelectable(): boolean
	{
		return this._isSelectable;
	}

	private _isPreSelectable: boolean;

	public get isPreSelectable(): boolean
	{
		return this._isPreSelectable;
	}

	private _isSellable: boolean;

	public get isSellable(): boolean
	{
		return this._isSellable;
	}

	private _parts: IFigurePart[];

	public get parts(): IFigurePart[]
	{
		return this._parts;
	}

	private _hiddenLayers: string[];

	public get hiddenLayers(): string[]
	{
		return this._hiddenLayers;
	}

	/**
	 * Finds a part by type and id.
	 *
	 * @param type - The part type identifier
	 * @param id - The part id
	 * @returns The matching figure part, or null if not found
	 */
	public getPart(type: string, id: number): IFigurePart | null
	{
		for (const part of this._parts)
		{
			if (part.type === type && part.id === id)
			{
				return part;
			}
		}

		return null;
	}

	public dispose(): void
	{
		this._parts = [];
		this._hiddenLayers = [];
	}

	/**
	 * Finds the insertion index for a part based on type and index ordering.
	 *
	 * @param part - The figure part to find insertion position for
	 * @returns The insertion index, or -1 if the part should be appended
	 */
	private _indexOfPartType(part: FigurePart): number
	{
		for (let i = 0; i < this._parts.length; i++)
		{
			const existing = this._parts[i];

			if (existing.type === part.type && existing.index < part.index)
			{
				return i;
			}
		}

		return -1;
	}
}

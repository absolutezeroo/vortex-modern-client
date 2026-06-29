import type {IStructureData} from './IStructureData';
import type {IFigureData} from './IFigureData';
import type {ISetType} from './figure/ISetType';
import type {IFigurePartSet} from './figure/IFigurePartSet';
import type {IPalette} from './figure/IPalette';
import {Palette} from './figure/Palette';
import {SetType} from './figure/SetType';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('FigureSetData');

/**
 * Manages figure set data including palettes and set types.
 * Implements both IStructureData for JSON parsing and IFigureData for data access.
 *
 * JSON structure expected:
 * ```json
 * {
 *   "colors": { "palette": [{ "id": 1, "color": [...] }] },
 *   "sets": { "settype": [{ "type": "hd", "paletteid": 1, "set": [...] }] }
 * }
 * ```
 *
 * @see sources/win63_version/habbo/avatar/structure/FigureSetData.as
 */
export class FigureSetData implements IStructureData, IFigureData
{
	private _palettes: Map<string, Palette>;
	private _setTypes: Map<string, SetType>;

	constructor()
	{
		this._palettes = new Map();
		this._setTypes = new Map();
	}

	/**
	 * Parses figure data from a JSON object, replacing any existing data.
	 *
	 * @param data - The JSON data to parse
	 * @returns True if parsing succeeded
	 */
	public parse(data: any): boolean
	{
		if (!data) return false;

		data = data.figuredata ?? data.figureData ?? data;

		let palettes: any[] | null = null;

		if (Array.isArray(data.palettes))
		{
			palettes = data.palettes;
		}
		else if (data.palettes && data.palettes.palette)
		{
			palettes = Array.isArray(data.palettes.palette)
				? data.palettes.palette
				: [data.palettes.palette];
		}
		else if (data.colors && data.colors.palette)
		{
			palettes = Array.isArray(data.colors.palette)
				? data.colors.palette
				: [data.colors.palette];
		}

		if (palettes)
		{
			for (const paletteData of palettes)
			{
				const id = String(paletteData.id);
				this._palettes.set(id, new Palette(paletteData));
			}
		}

		let setTypes: any[] | null = null;

		if (Array.isArray(data.setTypes))
		{
			setTypes = data.setTypes;
		}
		else if (Array.isArray(data.settypes))
		{
			setTypes = data.settypes;
		}
		else if (data.settypes && data.settypes.settype)
		{
			setTypes = Array.isArray(data.settypes.settype)
				? data.settypes.settype
				: [data.settypes.settype];
		}
		else if (Array.isArray(data.settype))
		{
			setTypes = data.settype;
		}
		else if (data.sets && data.sets.settype)
		{
			setTypes = Array.isArray(data.sets.settype)
				? data.sets.settype
				: [data.sets.settype];
		}

		if (setTypes)
		{
			for (const setTypeData of setTypes)
			{
				const type = String(setTypeData.type);
				this._setTypes.set(type, new SetType(setTypeData));
			}
		}

		//log.debug(`Parsed figure data: ${this._palettes.size} palettes, ${this._setTypes.size} set types [${Array.from(this._setTypes.keys()).join(', ')}]`);

		return true;
	}

	/**
	 * Injects JSON data, cleaning up existing entries before appending new ones.
	 *
	 * @param data - The JSON data to inject
	 */
	public injectJSON(data: any): void
	{
		data = data.figuredata ?? data.figureData ?? data;

		let setTypes: any[] | null = null;

		if (Array.isArray(data.setTypes))
		{
			setTypes = data.setTypes;
		}
		else if (Array.isArray(data.settypes))
		{
			setTypes = data.settypes;
		}
		else if (data.settypes && data.settypes.settype)
		{
			setTypes = Array.isArray(data.settypes.settype)
				? data.settypes.settype
				: [data.settypes.settype];
		}
		else if (Array.isArray(data.settypes))
		{
			setTypes = data.settypes;
		}
		else if (Array.isArray(data.settype))
		{
			setTypes = data.settype;
		}
		else if (data.sets && data.sets.settype)
		{
			setTypes = Array.isArray(data.sets.settype)
				? data.sets.settype
				: [data.sets.settype];
		}

		if (setTypes)
		{
			for (const setTypeData of setTypes)
			{
				const type = String(setTypeData.type);
				const existing = this._setTypes.get(type);

				if (existing)
				{
					existing.cleanUp(setTypeData);
				}
				else
				{
					this._setTypes.set(type, new SetType(setTypeData));
				}
			}
		}

		this.appendJSON(data);
	}

	/**
	 * Appends JSON data to existing palettes and set types without replacing them.
	 *
	 * @param data - The JSON data to append
	 * @returns True if appending succeeded
	 */
	public appendJSON(data: any): boolean
	{
		if (!data) return false;

		data = data.figuredata ?? data.figureData ?? data;

		let palettes: any[] | null = null;

		if (Array.isArray(data.palettes))
		{
			palettes = data.palettes;
		}
		else if (data.palettes && data.palettes.palette)
		{
			palettes = Array.isArray(data.palettes.palette)
				? data.palettes.palette
				: [data.palettes.palette];
		}
		else if (data.colors && data.colors.palette)
		{
			palettes = Array.isArray(data.colors.palette)
				? data.colors.palette
				: [data.colors.palette];
		}

		if (palettes)
		{
			for (const paletteData of palettes)
			{
				const id = String(paletteData.id);
				const existing = this._palettes.get(id);

				if (!existing)
				{
					this._palettes.set(id, new Palette(paletteData));
				}
				else
				{
					existing.append(paletteData);
				}
			}
		}

		let setTypes: any[] | null = null;

		if (Array.isArray(data.setTypes))
		{
			setTypes = data.setTypes;
		}
		else if (Array.isArray(data.settypes))
		{
			setTypes = data.settypes;
		}
		else if (data.settypes && data.settypes.settype)
		{
			setTypes = Array.isArray(data.settypes.settype)
				? data.settypes.settype
				: [data.settypes.settype];
		}
		else if (Array.isArray(data.settype))
		{
			setTypes = data.settype;
		}
		else if (data.sets && data.sets.settype)
		{
			setTypes = Array.isArray(data.sets.settype)
				? data.sets.settype
				: [data.sets.settype];
		}

		if (setTypes)
		{
			for (const setTypeData of setTypes)
			{
				const type = String(setTypeData.type);
				const existing = this._setTypes.get(type);

				if (!existing)
				{
					this._setTypes.set(type, new SetType(setTypeData));
				}
				else
				{
					existing.append(setTypeData);
				}
			}
		}

		return false;
	}

	/**
	 * Gets all mandatory set type identifiers for the given gender and club level.
	 *
	 * @param gender - The gender identifier ("M" or "F")
	 * @param clubLevel - The club membership level
	 * @returns An array of mandatory set type identifiers
	 */
	public getMandatorySetTypeIds(gender: string, clubLevel: number): string[]
	{
		const result: string[] = [];

		for (const setType of this._setTypes.values())
		{
			if (setType && setType.isMandatory(gender, clubLevel))
			{
				result.push(setType.type);
			}
		}

		return result;
	}

	/**
	 * Gets the default part set for the given type and gender.
	 *
	 * @param type - The set type identifier
	 * @param gender - The gender identifier
	 * @returns The default part set, or null if not found
	 */
	public getDefaultPartSet(type: string, gender: string): IFigurePartSet | null
	{
		const setType = this._setTypes.get(type);

		if (setType)
		{
			return setType.getDefaultPartSet(gender);
		}

		return null;
	}

	/**
	 * Gets a set type by its type identifier.
	 *
	 * @param type - The set type identifier (e.g. "hd", "hr", "ch")
	 * @returns The matching set type, or null if not found
	 */
	public getSetType(type: string): ISetType | null
	{
		return this._setTypes.get(type) ?? null;
	}

	/**
	 * Gets a palette by its numeric identifier.
	 *
	 * @param id - The palette identifier
	 * @returns The matching palette, or null if not found
	 */
	public getPalette(id: number): IPalette | null
	{
		return this._palettes.get(String(id)) ?? null;
	}

	/**
	 * Searches all set types for a figure part set with the given numeric identifier.
	 *
	 * @param id - The figure part set identifier
	 * @returns The matching part set, or null if not found
	 */
	public getFigurePartSet(id: number): IFigurePartSet | null
	{
		for (const setType of this._setTypes.values())
		{
			const partSet = setType.getPartSet(id);

			if (partSet !== null)
			{
				return partSet;
			}
		}

		return null;
	}

	public dispose(): void
	{
		this._palettes.clear();
		this._setTypes.clear();
	}
}

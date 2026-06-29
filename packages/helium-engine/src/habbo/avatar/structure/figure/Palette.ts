import type {IPartColor} from './IPartColor';
import type {IPalette} from './IPalette';
import {PartColor} from './PartColor';

/**
 * Represents a color palette for avatar figure parts, parsed from JSON.
 *
 * @see sources/win63_version/habbo/avatar/structure/figure/Palette.as
 */
export class Palette implements IPalette
{
	constructor(data: any)
	{
		this._id = parseInt(data.id) || 0;
		this._colors = new Map();
		this.append(data);
	}

	private _id: number;

	public get id(): number
	{
		return this._id;
	}

	private _colors: Map<number, IPartColor>;

	public get colors(): Map<number, IPartColor>
	{
		return this._colors;
	}

	/**
	 * Appends color entries from JSON data to this palette.
	 *
	 * @param data - The palette JSON data containing a color array
	 */
	public append(data: any): void
	{
		// Nitro format: data.colors, XML-JSON format: data.color or data.colors.color
		const rawColors = data.colors?.color || data.colors || data.color;

		if (!rawColors) return;

		const colors: any[] = Array.isArray(rawColors) ? rawColors : [rawColors];

		for (const colorData of colors)
		{
			const id = parseInt(colorData.id) || 0;
			this._colors.set(id, new PartColor(colorData));
		}
	}

	/**
	 * Retrieves a color by its identifier.
	 *
	 * @param colorId - The color identifier
	 * @returns The matching part color, or null if not found
	 */
	public getColor(colorId: number): IPartColor | null
	{
		return this._colors.get(colorId) ?? null;
	}
}

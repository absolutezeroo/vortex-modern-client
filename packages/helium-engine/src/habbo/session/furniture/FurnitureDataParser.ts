import {EventEmitter} from 'eventemitter3';
import {Logger} from '@core/utils/Logger';
import {FurnitureData} from './FurnitureData';

import type {IFurnitureData} from './IFurnitureData';

const log = Logger.getLogger('FurnitureDataParser');

/**
 * Events emitted by FurnitureDataParser
 */
export interface FurnitureDataParserEvents
{
	FDP_furniture_data_ready: [];
	FDP_furniture_data_error: [error: Error];
}

/**
 * Parses furniture data from JSON (modern Habbo format).
 *
 * Receives maps by reference and fills them during parsing.
 * Emits `FDP_furniture_data_ready` when parsing is complete.
 *
 * @see source_as_win63/habbo/session/furniture/FurnitureDataParser.as
 */
export class FurnitureDataParser
{
	private _floorItems: Map<number, IFurnitureData>;
	private _wallItems: Map<number, IFurnitureData>;
	private _floorItemsByName: Map<string, number[]>;
	private _wallItemsByName: Map<string, number[]>;
	private _disposed: boolean = false;

	constructor(
		floorItems: Map<number, IFurnitureData>,
		wallItems: Map<number, IFurnitureData>,
		floorItemsByName: Map<string, number[]>,
		wallItemsByName: Map<string, number[]>
	)
	{
		this._floorItems = floorItems;
		this._wallItems = wallItems;
		this._floorItemsByName = floorItemsByName;
		this._wallItemsByName = wallItemsByName;
	}

	private _events: EventEmitter<FurnitureDataParserEvents> = new EventEmitter();

	get events(): EventEmitter<FurnitureDataParserEvents>
	{
		return this._events;
	}

	/**
	 * Load and parse furniture data from URL
	 * @see source_as_win63/habbo/session/furniture/FurnitureDataParser.as loadData()
	 */
	async loadData(url: string): Promise<void>
	{
		try
		{
			const response = await fetch(url);

			if (!response.ok)
			{
				throw new Error(`Failed to load furniture data: ${response.status}`);
			}

			const data = await response.json();

			this.parseJsonFormat(data);

			log.info(`Parsed ${this._floorItems.size} floor items, ${this._wallItems.size} wall items`);

			this._events.emit('FDP_furniture_data_ready');
		}
		catch (error)
		{
			log.error('Failed to parse furniture data:', error);
			this._events.emit('FDP_furniture_data_error', error as Error);
		}
	}

	/**
	 * Dispose the parser
	 */
	dispose(): void
	{
		if (this._disposed) return;

		this._events.removeAllListeners();
		this._disposed = true;
	}

	/**
	 * Parse JSON furniture data format (modern Habbo servers)
	 *
	 * AS3 supports XML and Lingo formats.
	 * Modern servers use JSON, so we parse that instead.
	 *
	 * @see source_as_win63/habbo/session/furniture/FurnitureDataParser.as parseXmlFormat()
	 */
	private parseJsonFormat(data: Record<string, unknown>): void
	{
		const roomItemTypes = (data.roomitemtypes ?? null) as Record<string, unknown> | null;
		const wallItemTypes = (data.wallitemtypes ?? null) as Record<string, unknown> | null;

		if (roomItemTypes?.furnitype)
		{
			this.parseItems(roomItemTypes.furnitype as unknown[], 's');
		}

		if (wallItemTypes?.furnitype)
		{
			this.parseItems(wallItemTypes.furnitype as unknown[], 'i');
		}
	}

	/**
	 * Parse an array of furniture items
	 */
	private parseItems(items: unknown[], type: string): void
	{
		for (const item of items)
		{
			const raw = item as Record<string, unknown>;
			if (!raw) continue;

			const fullName = String(raw.classname || '');
			const nameParts = fullName.split('*');
			const className = nameParts[0];
			const colourIndex = nameParts.length > 1 ? parseInt(nameParts[1], 10) || 0 : 0;
			const hasIndexedColor = nameParts.length > 1;

			const colours = this.parseColours(raw.partcolors);

			const furnitureData = new FurnitureData(
				type,
				Number(raw.id),
				fullName,
				className,
				String(raw.name || ''),
				String(raw.description || ''),
				Number(raw.revision || 0),
				Number(raw.xdim || 1),
				Number(raw.ydim || 1),
				Number(raw.defaultdir !== undefined ? raw.defaultdir : 0),
				colours,
				hasIndexedColor,
				colourIndex,
				String(raw.adurl || ''),
				Number(raw.offerid || -1),
				Boolean(raw.buyout),
				Number(raw.rentofferid || -1),
				Boolean(raw.rentbuyout),
				Boolean(raw.bc),
				String(raw.customparams || ''),
				Number(raw.specialtype || 0),
				Boolean(raw.canstandon),
				Boolean(raw.cansiton),
				Boolean(raw.canlayon),
				Boolean(raw.excludeddynamic),
				String(raw.furniline || '')
			);

			this.storeItem(furnitureData);
		}
	}

	/**
	 * Store a furniture item in the appropriate maps
	 *
	 * @see source_as_win63/habbo/session/furniture/FurnitureDataParser.as storeItem()
	 */
	private storeItem(item: FurnitureData): void
	{
		let nameMap: Map<string, number[]>;

		if (item.type === 's')
		{
			this._floorItems.set(item.id, item);
			nameMap = this._floorItemsByName;
		}
		else
		{
			this._wallItems.set(item.id, item);
			nameMap = this._wallItemsByName;
		}

		let ids = nameMap.get(item.className);

		if (!ids)
		{
			ids = [];
			nameMap.set(item.className, ids);
		}

		ids[item.colourIndex] = item.id;
	}

	/**
	 * Parse colour data from JSON
	 */
	private parseColours(partcolors: unknown): number[]
	{
		const colours: number[] = [];

		if (!partcolors || typeof partcolors !== 'object') return colours;

		const pc = partcolors as { color?: unknown[] };

		if (!pc.color) return colours;

		for (const color of pc.color)
		{
			let colorCode = String(color);

			if (colorCode.startsWith('#'))
			{
				colorCode = colorCode.substring(1);
			}

			colours.push(parseInt(colorCode, 16));
		}

		return colours;
	}
}

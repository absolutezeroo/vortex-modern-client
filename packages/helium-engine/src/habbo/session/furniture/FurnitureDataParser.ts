import {EventEmitter} from 'eventemitter3';
import {Logger} from '@core/utils/Logger';
import {FurnitureData} from './FurnitureData';

import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IFurnitureData} from './IFurnitureData';

const log = Logger.getLogger('FurnitureDataParser');

export interface FurnitureDataParserEvents
{
	FDP_furniture_data_ready: [];
	FDP_furniture_data_error: [error: Error];
}

/**
 * Parses furnidata into AS3-compatible furniture maps.
 *
 * @see sources/win63_version/habbo/session/furniture/FurnitureDataParser.as
 */
export class FurnitureDataParser
{
	private _floorItems: Map<number, IFurnitureData>;
	private _wallItems: Map<number, IFurnitureData>;
	private _floorItemsByName: Map<string, number[]>;
	private _wallItemsByName: Map<string, number[]>;
	private _localization: IHabboLocalizationManager | null;
	private _critical: boolean;
	private _events: EventEmitter<FurnitureDataParserEvents> = new EventEmitter();
	private _disposed: boolean = false;

	// AS3: sources/win63_version/habbo/session/furniture/FurnitureDataParser.as::FurnitureDataParser()
	constructor(
		floorItems: Map<number, IFurnitureData>,
		wallItems: Map<number, IFurnitureData>,
		floorItemsByName: Map<string, number[]>,
		wallItemsByName: Map<string, number[]>,
		localization: IHabboLocalizationManager | null,
		critical: boolean = true
	)
	{
		this._floorItems = floorItems;
		this._wallItems = wallItems;
		this._floorItemsByName = floorItemsByName;
		this._wallItemsByName = wallItemsByName;
		this._localization = localization;
		this._critical = critical;
	}

	get events(): EventEmitter<FurnitureDataParserEvents>
	{
		return this._events;
	}

	// AS3: sources/win63_version/habbo/session/furniture/FurnitureDataParser.as::loadData()
	async loadData(url: string): Promise<void>
	{
		try
		{
			const response = await fetch(url);

			if(!response.ok)
			{
				throw new Error(`Failed to load furniture data: ${response.status}`);
			}

			const data = await response.text();

			this.parseFurnitureData(data);

			log.info(`Parsed ${this._floorItems.size} floor items, ${this._wallItems.size} wall items`);
			this._events.emit('FDP_furniture_data_ready');
		}
		catch(error)
		{
			const err = error instanceof Error ? error : new Error(String(error));

			if(this._critical)
			{
				log.error('Failed to parse furniture data:', err);
			}
			else
			{
				log.warn(`Failed to parse furniture data: ${err.message}`);
			}

			this._events.emit('FDP_furniture_data_error', err);
		}
	}

	// AS3: sources/win63_version/habbo/session/furniture/FurnitureDataParser.as::parseFurnitureData()
	private parseFurnitureData(data: string): void
	{
		if(data.charAt(0) === '<')
		{
			this.parseXmlFormat(data);
			return;
		}

		const trimmed = data.trim();

		if(trimmed.charAt(0) === '{' || trimmed.charAt(0) === '[')
		{
			this.parseJsonFormat(JSON.parse(trimmed) as Record<string, unknown>);
			return;
		}

		this.parseLingoFormat(data);
	}

	// AS3: sources/win63_version/habbo/session/furniture/FurnitureDataParser.as::parseXmlFormat()
	private parseXmlFormat(data: string): void
	{
		const document = new DOMParser().parseFromString(data, 'text/xml');

		if(document.getElementsByTagName('parsererror').length > 0)
		{
			throw new Error('XML furni data was malformed');
		}

		for(const item of Array.from(document.querySelectorAll('roomitemtypes > furnitype')))
		{
			const furnitureData = this.parseXmlFloorItem(item);
			this.storeItem(furnitureData);
			this.registerFurnitureLocalization(furnitureData);
		}

		for(const item of Array.from(document.querySelectorAll('wallitemtypes > furnitype')))
		{
			const furnitureData = this.parseXmlWallItem(item);
			this.storeItem(furnitureData);
			this.registerFurnitureLocalization(furnitureData);
		}
	}

	// AS3: sources/win63_version/habbo/session/furniture/FurnitureDataParser.as::parseFloorItem()
	private parseXmlFloorItem(item: Element): FurnitureData
	{
		const id = this.getAttributeNumber(item, 'id', 0);
		const colours = this.parseXmlColours(item);
		const fullName = this.getAttributeString(item, 'classname');
		const nameParts = fullName.split('*');
		const className = nameParts[0];
		const colourIndex = nameParts.length > 1 ? parseInt(nameParts[1], 10) : 0;
		const hasIndexedColor = nameParts.length > 1;

		return new FurnitureData(
			's',
			id,
			fullName,
			className,
			this.getChildString(item, 'name'),
			'',
			this.getChildNumber(item, 'revision', 0),
			this.getChildNumber(item, 'xdim', 0),
			this.getChildNumber(item, 'ydim', 0),
			0,
			colours,
			hasIndexedColor,
			colourIndex,
			this.getChildString(item, 'adurl'),
			this.getChildNumber(item, 'offerid', 0),
			this.getChildString(item, 'buyout') === '1',
			this.getChildNumber(item, 'rentofferid', 0),
			this.getChildString(item, 'rentbuyout') === '1',
			this.getChildString(item, 'bc') === '1',
			this.getChildString(item, 'customparams'),
			this.getChildNumber(item, 'specialtype', 0),
			this.getChildString(item, 'canstandon') === '1',
			this.getChildString(item, 'cansiton') === '1',
			this.getChildString(item, 'canlayon') === '1',
			this.getChildString(item, 'excludeddynamic') === '1',
			this.getChildString(item, 'furniline'),
			this.getChildNumber(item, 'bcofferid', 0)
		);
	}

	// AS3: sources/win63_version/habbo/session/furniture/FurnitureDataParser.as::parseWallItem()
	private parseXmlWallItem(item: Element): FurnitureData
	{
		const id = this.getAttributeNumber(item, 'id', 0);
		const className = this.getAttributeString(item, 'classname');

		return new FurnitureData(
			'i',
			id,
			className,
			className,
			this.getChildString(item, 'name'),
			'',
			this.getChildNumber(item, 'revision', 0),
			0,
			0,
			0,
			null,
			false,
			0,
			this.getChildString(item, 'adurl'),
			this.getChildNumber(item, 'offerid', 0),
			this.getChildString(item, 'buyout') === '1',
			this.getChildNumber(item, 'rentofferid', 0),
			this.getChildString(item, 'rentbuyout') === '1',
			this.getChildString(item, 'bc') === '1',
			null,
			this.getChildNumber(item, 'specialtype', 0),
			false,
			false,
			false,
			this.getChildString(item, 'excludeddynamic') === '1',
			this.getChildString(item, 'furniline'),
			this.getChildNumber(item, 'bcofferid', 0)
		);
	}

	private parseJsonFormat(data: Record<string, unknown>): void
	{
		const roomItemTypes = this.asRecord(data['roomitemtypes']);
		const wallItemTypes = this.asRecord(data['wallitemtypes']);

		for(const item of this.asRecordArray(roomItemTypes?.['furnitype'] ?? null))
		{
			const furnitureData = this.parseJsonFloorItem(item);
			this.storeItem(furnitureData);
			this.registerFurnitureLocalization(furnitureData);
		}

		for(const item of this.asRecordArray(wallItemTypes?.['furnitype'] ?? null))
		{
			const furnitureData = this.parseJsonWallItem(item);
			this.storeItem(furnitureData);
			this.registerFurnitureLocalization(furnitureData);
		}
	}

	private parseJsonFloorItem(item: Record<string, unknown>): FurnitureData
	{
		const fullName = this.getRawString(item, 'classname', 'className');
		const nameParts = fullName.split('*');
		const className = nameParts[0];
		const colourIndex = nameParts.length > 1 ? parseInt(nameParts[1], 10) : 0;
		const hasIndexedColor = nameParts.length > 1;

		return new FurnitureData(
			's',
			this.getRawNumber(item, 0, 'id'),
			fullName,
			className,
			this.getRawString(item, 'name'),
			this.getRawString(item, 'description'),
			this.getRawNumber(item, 0, 'revision'),
			this.getRawNumber(item, 0, 'xdim'),
			this.getRawNumber(item, 0, 'ydim'),
			0,
			this.parseJsonColours(item['partcolors']),
			hasIndexedColor,
			colourIndex,
			this.getRawString(item, 'adurl'),
			this.getRawNumber(item, 0, 'offerid'),
			this.getRawBoolean(item, 'buyout'),
			this.getRawNumber(item, 0, 'rentofferid'),
			this.getRawBoolean(item, 'rentbuyout'),
			this.getRawBoolean(item, 'bc'),
			this.getRawString(item, 'customparams'),
			this.getRawNumber(item, 0, 'specialtype'),
			this.getRawBoolean(item, 'canstandon'),
			this.getRawBoolean(item, 'cansiton'),
			this.getRawBoolean(item, 'canlayon'),
			this.getRawBoolean(item, 'excludeddynamic'),
			this.getRawString(item, 'furniline'),
			this.getRawNumber(item, 0, 'bcofferid')
		);
	}

	private parseJsonWallItem(item: Record<string, unknown>): FurnitureData
	{
		const className = this.getRawString(item, 'classname', 'className');

		return new FurnitureData(
			'i',
			this.getRawNumber(item, 0, 'id'),
			className,
			className,
			this.getRawString(item, 'name'),
			this.getRawString(item, 'description'),
			this.getRawNumber(item, 0, 'revision'),
			0,
			0,
			0,
			null,
			false,
			0,
			this.getRawString(item, 'adurl'),
			this.getRawNumber(item, 0, 'offerid'),
			this.getRawBoolean(item, 'buyout'),
			this.getRawNumber(item, 0, 'rentofferid'),
			this.getRawBoolean(item, 'rentbuyout'),
			this.getRawBoolean(item, 'bc'),
			null,
			this.getRawNumber(item, 0, 'specialtype'),
			false,
			false,
			false,
			this.getRawBoolean(item, 'excludeddynamic'),
			this.getRawString(item, 'furniline'),
			this.getRawNumber(item, 0, 'bcofferid')
		);
	}

	// AS3: sources/win63_version/habbo/session/furniture/FurnitureDataParser.as::parseLingoFormat()
	private parseLingoFormat(data: string): void
	{
		const lineRegex = /\n\r{1,}|\n{1,}|\r{1,}/gm;
		const bracketRegex = /\[+?((.)*?)\]/g;
		const lines = data.split(lineRegex);

		for(const line of lines)
		{
			const matches = line.match(bracketRegex);

			if(matches === null)
			{
				continue;
			}

			for(const match of matches)
			{
				const values = this.parseLingoEntry(match);

				if(values.length < 18)
				{
					throw new Error('Lingo furni data was malformed');
				}

				const type = values[0];
				const id = parseInt(values[1], 10);
				const fullName = String(values[2]);
				const nameParts = fullName.split('*');
				const className = nameParts[0];
				const colourIndex = nameParts.length > 1 ? parseInt(nameParts[1], 10) : 0;
				const hasIndexedColor = nameParts.length > 1;
				const colours = this.parseColourList(values[7].split(','));
				const isWallItem = type === 'i';
				let canStandOn = false;
				let canSitOn = false;
				let canLayOn = false;
				let excludedFromDynamic = false;

				if(isWallItem)
				{
					excludedFromDynamic = values.length >= 19 && values[18] === '1';
				}
				else
				{
					canStandOn = values[18] === '1';
					canSitOn = values[19] === '1';
					canLayOn = values[20] === '1';
					excludedFromDynamic = values.length >= 22 && values[21] === '1';
				}

				const furnitureData = new FurnitureData(
					type,
					id,
					fullName,
					className,
					values[8],
					values[9],
					parseInt(values[3], 10),
					parseInt(values[4], 10),
					parseInt(values[5], 10),
					parseInt(values[6], 10),
					colours,
					hasIndexedColor,
					colourIndex,
					values[10],
					parseInt(values[11], 10),
					values[12] === 'true',
					parseInt(values[13], 10),
					values[14] === 'true',
					values[17] === 'true',
					values[15],
					parseInt(values[16], 10),
					canStandOn,
					canSitOn,
					canLayOn,
					excludedFromDynamic,
					'',
					-1
				);

				this.storeItem(furnitureData);
				this.registerFurnitureLocalization(furnitureData);
			}
		}
	}

	private parseLingoEntry(entry: string): string[]
	{
		let value = entry.replace(/\[{1,}/gm, '');
		value = value.replace(/\]{1,}/gm, '');

		const values = value.split('"');
		this.removePatternFrom(values, ', ');
		this.removePatternFrom(values, ',');
		values.splice(0, 1);
		values.splice(values.length - 1, 1);

		return values;
	}

	// AS3: sources/win63_version/habbo/session/furniture/FurnitureDataParser.as::storeItem()
	private storeItem(item: FurnitureData): void
	{
		let nameMap: Map<string, number[]> | null = null;

		if(item.type === 's')
		{
			this._floorItems.set(item.id, item);
			nameMap = this._floorItemsByName;
		}
		else if(item.type === 'i')
		{
			this._wallItems.set(item.id, item);
			nameMap = this._wallItemsByName;
		}

		if(nameMap === null)
		{
			return;
		}

		let ids = nameMap.get(item.className) ?? null;

		if(ids === null)
		{
			ids = [];
			nameMap.set(item.className, ids);
		}

		ids[item.colourIndex] = item.id;
	}

	// AS3: sources/win63_version/habbo/session/furniture/FurnitureDataParser.as::registerFurnitureLocalization()
	private registerFurnitureLocalization(item: FurnitureData): void
	{
		if(this._localization === null)
		{
			return;
		}

		if(item.type === 's')
		{
			this._localization.updateLocalization(`roomItem.name.${item.id}`, item.localizedName);
			this._localization.updateLocalization(`roomItem.desc.${item.id}`, item.description);
		}
		else if(item.type === 'i')
		{
			this._localization.updateLocalization(`wallItem.name.${item.id}`, item.localizedName);
			this._localization.updateLocalization(`wallItem.desc.${item.id}`, item.description);
		}
	}

	private parseXmlColours(item: Element): number[]
	{
		const partColors = item.getElementsByTagName('partcolors')[0] ?? null;

		if(partColors === null)
		{
			return [];
		}

		const values: string[] = [];

		for(const color of Array.from(partColors.getElementsByTagName('color')))
		{
			values.push(color.textContent ?? '');
		}

		return this.parseColourList(values);
	}

	private parseJsonColours(partColors: unknown): number[]
	{
		const record = this.asRecord(partColors);

		if(record === null)
		{
			return [];
		}

		const color = record['color'];
		const values: string[] = [];

		if(Array.isArray(color))
		{
			for(const value of color)
			{
				values.push(String(value));
			}
		}
		else if(color !== null && color !== undefined)
		{
			values.push(String(color));
		}

		return this.parseColourList(values);
	}

	private parseColourList(values: string[]): number[]
	{
		const colours: number[] = [];

		for(const value of values)
		{
			let color = value;

			if(color.charAt(0) === '#')
			{
				color = color.replace('#', '');
				colours.push(parseInt(color, 16));
			}
			else
			{
				colours.push(-parseInt(color, 10));
			}
		}

		return colours;
	}

	private removePatternFrom(values: string[], pattern: string): void
	{
		let index = 0;

		while(index < values.length)
		{
			if(values[index] === pattern)
			{
				values.splice(index, 1);
				index--;
			}

			index++;
		}
	}

	private getChildString(element: Element, name: string): string
	{
		for(let index = 0; index < element.children.length; index++)
		{
			const child = element.children[index];

			if(child.tagName === name)
			{
				return child.textContent ?? '';
			}
		}

		return '';
	}

	private getChildNumber(element: Element, name: string, defaultValue: number): number
	{
		const value = this.getChildString(element, name);

		if(value.length === 0)
		{
			return defaultValue;
		}

		const parsed = Number(value);

		return Number.isNaN(parsed) ? defaultValue : parsed;
	}

	private getAttributeString(element: Element, name: string): string
	{
		return element.getAttribute(name) ?? '';
	}

	private getAttributeNumber(element: Element, name: string, defaultValue: number): number
	{
		const value = this.getAttributeString(element, name);

		if(value.length === 0)
		{
			return defaultValue;
		}

		const parsed = Number(value);

		return Number.isNaN(parsed) ? defaultValue : parsed;
	}

	private getRawString(data: Record<string, unknown>, ...keys: string[]): string
	{
		for(const key of keys)
		{
			const value = data[key];

			if(value !== null && value !== undefined)
			{
				return String(value);
			}
		}

		return '';
	}

	private getRawNumber(data: Record<string, unknown>, defaultValue: number, ...keys: string[]): number
	{
		const value = this.getRawString(data, ...keys);

		if(value.length === 0)
		{
			return defaultValue;
		}

		const parsed = Number(value);

		return Number.isNaN(parsed) ? defaultValue : parsed;
	}

	private getRawBoolean(data: Record<string, unknown>, key: string): boolean
	{
		const value = data[key];

		if(typeof value === 'boolean')
		{
			return value;
		}

		if(typeof value === 'number')
		{
			return value !== 0;
		}

		if(typeof value === 'string')
		{
			const lower = value.toLowerCase();

			return lower === '1' || lower === 'true';
		}

		return false;
	}

	private asRecord(value: unknown): Record<string, unknown> | null
	{
		if(value !== null && value !== undefined && typeof value === 'object' && !Array.isArray(value))
		{
			return value as Record<string, unknown>;
		}

		return null;
	}

	private asRecordArray(value: unknown): Record<string, unknown>[]
	{
		if(Array.isArray(value))
		{
			return value.filter((item): item is Record<string, unknown> => this.asRecord(item) !== null);
		}

		const record = this.asRecord(value);

		return record !== null ? [record] : [];
	}

	// AS3: sources/win63_version/habbo/session/furniture/FurnitureDataParser.as::dispose()
	dispose(): void
	{
		if(this._disposed) return;

		this._events.removeAllListeners();
		this._floorItems = null as unknown as Map<number, IFurnitureData>;
		this._wallItems = null as unknown as Map<number, IFurnitureData>;
		this._floorItemsByName = null as unknown as Map<string, number[]>;
		this._wallItemsByName = null as unknown as Map<string, number[]>;
		this._localization = null;
		this._disposed = true;
	}
}

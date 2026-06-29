import {normalizeLocalAssetUrl} from '@core/utils/urlUtils';
import type {IGameDataResources} from './IGameDataResources';

interface HashEntry
{
	name: string;
	url: string;
	hash: string;
}

interface HashesData
{
	hashes: HashEntry[];
}

/**
 * Game data resources containing hashes for external files
 *
 * Based on AS3 sources/win63_version/core/localization/class_2118.as
 */
// AS3: sources/win63_version/core/localization/class_2118.as::class_2118()
export class GameDataResources implements IGameDataResources
{
	private _externalVariablesUrl: string = '';

	// AS3: sources/win63_version/core/localization/class_2118.as::getExternalVariablesUrl()
	get externalVariablesUrl(): string
	{
		return this._externalVariablesUrl;
	}

	private _externalVariablesHash: string = '';

	// AS3: sources/win63_version/core/localization/class_2118.as::getExternalVariablesHash()
	get externalVariablesHash(): string
	{
		return this._externalVariablesHash;
	}

	private _externalTextsUrl: string = '';

	// AS3: sources/win63_version/core/localization/class_2118.as::getExternalTextsUrl()
	get externalTextsUrl(): string
	{
		return this._externalTextsUrl;
	}

	private _externalTextsHash: string = '';

	// AS3: sources/win63_version/core/localization/class_2118.as::getExternalTextsHash()
	get externalTextsHash(): string
	{
		return this._externalTextsHash;
	}

	private _furnitureDataUrl: string = '';

	// AS3: sources/win63_version/core/localization/class_2118.as::getFurniDataUrl()
	get furnitureDataUrl(): string
	{
		return this._furnitureDataUrl;
	}

	private _furnitureDataHash: string = '';

	// AS3: sources/win63_version/core/localization/class_2118.as::getFurniDataHash()
	get furnitureDataHash(): string
	{
		return this._furnitureDataHash;
	}

	private _productDataUrl: string = '';

	// AS3: sources/win63_version/core/localization/class_2118.as::getProductDataUrl()
	get productDataUrl(): string
	{
		return this._productDataUrl;
	}

	private _productDataHash: string = '';

	// AS3: sources/win63_version/core/localization/class_2118.as::getProductDataHash()
	get productDataHash(): string
	{
		return this._productDataHash;
	}

	/**
	 * Parse game data resources from JSON string
	 */
	// AS3: sources/win63_version/core/localization/class_2118.as::parse()
	static parse(data: string): GameDataResources
	{
		let parsed: HashesData;
		try
		{
			parsed = JSON.parse(data) as HashesData;
		}
		catch
		{
			throw new Error('[GameDataResources] Failed to parse game data JSON');
		}
		const resources = new GameDataResources();

		for (const entry of parsed.hashes)
		{
			const url = normalizeLocalAssetUrl(entry.url);

			switch (entry.name)
			{
				case 'external_texts':
					resources._externalTextsUrl = url;
					resources._externalTextsHash = entry.hash;
					break;
				case 'external_variables':
					resources._externalVariablesUrl = url;
					resources._externalVariablesHash = entry.hash;
					break;
				case 'furnidata':
					resources._furnitureDataUrl = url;
					resources._furnitureDataHash = entry.hash;
					break;
				case 'productdata':
					resources._productDataUrl = url;
					resources._productDataHash = entry.hash;
					break;
			}
		}

		return resources;
	}

	// AS3: sources/win63_version/core/localization/class_2118.as::isValid()
	isValid(): boolean
	{
		return !!(
			this._externalTextsUrl &&
			this._externalTextsHash &&
			this._externalVariablesUrl &&
			this._externalVariablesHash &&
			this._furnitureDataUrl &&
			this._furnitureDataHash &&
			this._productDataUrl &&
			this._productDataHash
		);
	}
}
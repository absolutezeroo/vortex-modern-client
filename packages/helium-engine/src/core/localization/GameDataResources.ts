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
 * Based on AS3 com.sulake.core.localization.class_2118
 */
export class GameDataResources implements IGameDataResources
{
	private _externalFlashTextsUrl: string = '';

	get externalFlashTextsUrl(): string
	{
		return this._externalFlashTextsUrl;
	}

	private _externalFlashTextsHash: string = '';

	get externalFlashTextsHash(): string
	{
		return this._externalFlashTextsHash;
	}

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

	private _figureDataUrl: string = '';

	get figureDataUrl(): string
	{
		return this._figureDataUrl;
	}

	private _figureDataHash: string = '';

	get figureDataHash(): string
	{
		return this._figureDataHash;
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
				case 'external_flash_texts':
					resources._externalFlashTextsUrl = url;
					resources._externalFlashTextsHash = entry.hash;
					break;
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
				case 'figuredata':
					resources._figureDataUrl = url;
					resources._figureDataHash = entry.hash;
					break;
				case 'productdata':
					resources._productDataUrl = url;
					resources._productDataHash = entry.hash;
					break;
			}
		}

		if (!resources._externalTextsUrl && !resources._externalTextsHash &&
			resources._externalFlashTextsUrl && resources._externalFlashTextsHash)
		{
			// Current asset hosts can expose the AS3 external_texts payload under the Flash-era external_flash_texts name.
			resources._externalTextsUrl = resources._externalFlashTextsUrl;
			resources._externalTextsHash = resources._externalFlashTextsHash;
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
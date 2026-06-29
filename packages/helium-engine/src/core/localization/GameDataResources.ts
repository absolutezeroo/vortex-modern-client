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
	private _effectMapUrl: string = '';

	get effectMapUrl(): string
	{
		return this._effectMapUrl;
	}

	private _effectMapHash: string = '';

	get effectMapHash(): string
	{
		return this._effectMapHash;
	}

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

	private _externalUiVariablesUrl: string = '';

	get externalUiVariablesUrl(): string
	{
		return this._externalUiVariablesUrl;
	}

	private _externalUiVariablesHash: string = '';

	get externalUiVariablesHash(): string
	{
		return this._externalUiVariablesHash;
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

	private _figureMapUrl: string = '';

	get figureMapUrl(): string
	{
		return this._figureMapUrl;
	}

	private _figureMapHash: string = '';

	get figureMapHash(): string
	{
		return this._figureMapHash;
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

	private _habboAvatarActionsUrl: string = '';

	get habboAvatarActionsUrl(): string
	{
		return this._habboAvatarActionsUrl;
	}

	private _habboAvatarActionsHash: string = '';

	get habboAvatarActionsHash(): string
	{
		return this._habboAvatarActionsHash;
	}

	private _habboAvatarAnimationsUrl: string = '';

	get habboAvatarAnimationsUrl(): string
	{
		return this._habboAvatarAnimationsUrl;
	}

	private _habboAvatarAnimationsHash: string = '';

	get habboAvatarAnimationsHash(): string
	{
		return this._habboAvatarAnimationsHash;
	}

	private _habboAvatarGeometryUrl: string = '';

	get habboAvatarGeometryUrl(): string
	{
		return this._habboAvatarGeometryUrl;
	}

	private _habboAvatarGeometryHash: string = '';

	get habboAvatarGeometryHash(): string
	{
		return this._habboAvatarGeometryHash;
	}

	private _habboAvatarPartSetsUrl: string = '';

	get habboAvatarPartSetsUrl(): string
	{
		return this._habboAvatarPartSetsUrl;
	}

	private _habboAvatarPartSetsHash: string = '';

	get habboAvatarPartSetsHash(): string
	{
		return this._habboAvatarPartSetsHash;
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
				case 'effect_map':
					resources._effectMapUrl = url;
					resources._effectMapHash = entry.hash;
					break;
				case 'external_flash_texts':
					resources._externalFlashTextsUrl = url;
					resources._externalFlashTextsHash = entry.hash;
					break;
				case 'external_renderer_variables':
				case 'external_variables':
					resources._externalVariablesUrl = url;
					resources._externalVariablesHash = entry.hash;
					break;
				case 'external_ui_variables':
					resources._externalUiVariablesUrl = url;
					resources._externalUiVariablesHash = entry.hash;
					break;
				case 'external_texts':
					resources._externalTextsUrl = url;
					resources._externalTextsHash = entry.hash;
					break;
				case 'figure_data':
					resources._figureDataUrl = url;
					resources._figureDataHash = entry.hash;
					break;
				case 'figure_map':
					resources._figureMapUrl = url;
					resources._figureMapHash = entry.hash;
					break;
				case 'furnidata':
				case 'furniture_data':
					resources._furnitureDataUrl = url;
					resources._furnitureDataHash = entry.hash;
					break;
				case 'habbo_avatar_actions':
					resources._habboAvatarActionsUrl = url;
					resources._habboAvatarActionsHash = entry.hash;
					break;
				case 'habbo_avatar_animations':
					resources._habboAvatarAnimationsUrl = url;
					resources._habboAvatarAnimationsHash = entry.hash;
					break;
				case 'habbo_avatar_geometry':
					resources._habboAvatarGeometryUrl = url;
					resources._habboAvatarGeometryHash = entry.hash;
					break;
				case 'habbo_avatar_part_sets':
					resources._habboAvatarPartSetsUrl = url;
					resources._habboAvatarPartSetsHash = entry.hash;
					break;
				case 'productdata':
				case 'product_data':
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
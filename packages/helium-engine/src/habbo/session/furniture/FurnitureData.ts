import type {IFurnitureData} from './IFurnitureData';

/**
 * Furniture data implementation
 *
 * Stores all metadata about a single furniture item (floor or wall).
 *
 * @see source_as_win63/habbo/session/furniture/FurnitureData.as
 * @see source_as_flash/com/sulake/habbo/session/furniture/FurnitureData.as
 */
export class FurnitureData implements IFurnitureData
{
	constructor(
		type: string,
		id: number,
		fullName: string,
		className: string,
		localizedName: string,
		description: string,
		revision: number,
		tileSizeX: number,
		tileSizeY: number,
		tileSizeZ: number,
		colours: number[],
		hasIndexedColor: boolean,
		colourIndex: number,
		adUrl: string,
		purchaseOfferId: number,
		purchaseCouldBeUsedForBuyout: boolean,
		rentOfferId: number,
		rentCouldBeUsedForBuyout: boolean,
		availableForBuildersClub: boolean,
		customParams: string,
		category: number,
		canStandOn: boolean,
		canSitOn: boolean,
		canLayOn: boolean,
		excludedFromDynamic: boolean,
		furniLine: string
	)
	{
		this._type = type;
		this._id = id;
		this._fullName = fullName;
		this._className = className;
		this._localizedName = localizedName;
		this._description = description;
		this._revision = revision;
		this._tileSizeX = tileSizeX;
		this._tileSizeY = tileSizeY;
		this._tileSizeZ = tileSizeZ;
		this._colours = colours;
		this._hasIndexedColor = hasIndexedColor;
		this._colourIndex = colourIndex;
		this._adUrl = adUrl;
		this._purchaseOfferId = purchaseOfferId;
		this._purchaseCouldBeUsedForBuyout = purchaseCouldBeUsedForBuyout;
		this._rentOfferId = rentOfferId;
		this._rentCouldBeUsedForBuyout = rentCouldBeUsedForBuyout;
		this._availableForBuildersClub = availableForBuildersClub;
		this._customParams = customParams;
		this._category = category;
		this._canStandOn = canStandOn;
		this._canSitOn = canSitOn;
		this._canLayOn = canLayOn;
		this._excludedFromDynamic = excludedFromDynamic;
		this._furniLine = furniLine;
	}

	private _type: string;

	get type(): string
	{
		return this._type;
	}

	private _id: number;

	get id(): number
	{
		return this._id;
	}

	private _fullName: string;

	get fullName(): string
	{
		return this._fullName;
	}

	private _className: string;

	get className(): string
	{
		return this._className;
	}

	private _localizedName: string;

	get localizedName(): string
	{
		return this._localizedName;
	}

	private _description: string;

	get description(): string
	{
		return this._description;
	}

	private _revision: number;

	get revision(): number
	{
		return this._revision;
	}

	private _tileSizeX: number;

	get tileSizeX(): number
	{
		return this._tileSizeX;
	}

	private _tileSizeY: number;

	get tileSizeY(): number
	{
		return this._tileSizeY;
	}

	private _tileSizeZ: number;

	get tileSizeZ(): number
	{
		return this._tileSizeZ;
	}

	private _colours: number[];

	get colours(): number[]
	{
		return this._colours;
	}

	private _hasIndexedColor: boolean;

	get hasIndexedColor(): boolean
	{
		return this._hasIndexedColor;
	}

	private _colourIndex: number;

	get colourIndex(): number
	{
		return this._colourIndex;
	}

	private _adUrl: string;

	get adUrl(): string
	{
		return this._adUrl;
	}

	private _purchaseOfferId: number;

	get purchaseOfferId(): number
	{
		return this._purchaseOfferId;
	}

	private _purchaseCouldBeUsedForBuyout: boolean;

	get purchaseCouldBeUsedForBuyout(): boolean
	{
		return this._purchaseCouldBeUsedForBuyout;
	}

	private _rentOfferId: number;

	get rentOfferId(): number
	{
		return this._rentOfferId;
	}

	private _rentCouldBeUsedForBuyout: boolean;

	get rentCouldBeUsedForBuyout(): boolean
	{
		return this._rentCouldBeUsedForBuyout;
	}

	private _availableForBuildersClub: boolean;

	get availableForBuildersClub(): boolean
	{
		return this._availableForBuildersClub;
	}

	private _customParams: string;

	get customParams(): string
	{
		return this._customParams;
	}

	private _category: number;

	get category(): number
	{
		return this._category;
	}

	private _canStandOn: boolean;

	get canStandOn(): boolean
	{
		return this._canStandOn;
	}

	private _canSitOn: boolean;

	get canSitOn(): boolean
	{
		return this._canSitOn;
	}

	private _canLayOn: boolean;

	get canLayOn(): boolean
	{
		return this._canLayOn;
	}

	private _excludedFromDynamic: boolean;

	get excludedFromDynamic(): boolean
	{
		return this._excludedFromDynamic;
	}

	private _furniLine: string;

	get furniLine(): string
	{
		return this._furniLine;
	}

	get isExternalImageType(): boolean
	{
		return (this._adUrl !== null && this._adUrl.length > 0);
	}
}

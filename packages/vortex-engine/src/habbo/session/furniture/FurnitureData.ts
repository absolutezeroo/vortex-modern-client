import type {IFurnitureData} from './IFurnitureData';

/**
 * Furniture data implementation.
 *
 * @see sources/win63_version/habbo/session/furniture/FurnitureData.as
 */
export class FurnitureData implements IFurnitureData
{
    public static readonly FURNITURE_TYPE_ITEM = 'i';
    public static readonly FURNITURE_TYPE_STUFF = 's';

    private _type: string;
    private _id: number;
    private _className: string;
    private _fullName: string;
    private _hasIndexedColor: boolean;
    private _colourIndex: number;
    private _revision: number;
    private _tileSizeX: number;
    private _tileSizeY: number;
    private _tileSizeZ: number;
    private _colours: number[] | null;
    private _localizedName: string;
    private _description: string;
    private _adUrl: string;
    private _purchaseOfferId: number;
    private _rentOfferId: number;
    private _customParams: string | null;
    private _category: number;
    private _purchaseCouldBeUsedForBuyout: boolean;
    private _rentCouldBeUsedForBuyout: boolean;
    private _availableForBuildersClub: boolean;
    private _canStandOn: boolean;
    private _canSitOn: boolean;
    private _canLayOn: boolean;
    private _excludedFromDynamic: boolean;
    private _furniLine: string;
    private _bcOfferId: number;
    private _tradeable: boolean;

    // AS3: sources/win63_version/habbo/session/furniture/FurnitureData.as::FurnitureData()
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
        colours: number[] | null,
        hasIndexedColor: boolean,
        colourIndex: number,
        adUrl: string,
        purchaseOfferId: number,
        purchaseCouldBeUsedForBuyout: boolean,
        rentOfferId: number,
        rentCouldBeUsedForBuyout: boolean,
        availableForBuildersClub: boolean,
        customParams: string | null,
        category: number,
        canStandOn: boolean,
        canSitOn: boolean,
        canLayOn: boolean,
        excludedFromDynamic: boolean,
        furniLine: string,
        bcOfferId: number,
        tradeable: boolean = false
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
        this._bcOfferId = bcOfferId;
        this._tradeable = tradeable;
    }

    // AS3: sources/win63_version/habbo/session/furniture/FurnitureData.as::get type()
    get type(): string
    {
        return this._type;
    }

    // AS3: sources/win63_version/habbo/session/furniture/FurnitureData.as::get id()
    get id(): number
    {
        return this._id;
    }

    // AS3: sources/win63_version/habbo/session/furniture/FurnitureData.as::get className()
    get className(): string
    {
        return this._className;
    }

    // AS3: sources/win63_version/habbo/session/furniture/FurnitureData.as::set className()
    set className(value: string)
    {
        this._className = value;
    }

    // AS3: sources/win63_version/habbo/session/furniture/FurnitureData.as::get fullName()
    get fullName(): string
    {
        return this._fullName;
    }

    // AS3: sources/win63_version/habbo/session/furniture/FurnitureData.as::get hasIndexedColor()
    get hasIndexedColor(): boolean
    {
        return this._hasIndexedColor;
    }

    // AS3: sources/win63_version/habbo/session/furniture/FurnitureData.as::get colourIndex()
    get colourIndex(): number
    {
        return this._colourIndex;
    }

    // AS3: sources/win63_version/habbo/session/furniture/FurnitureData.as::get revision()
    get revision(): number
    {
        return this._revision;
    }

    // AS3: sources/win63_version/habbo/session/furniture/FurnitureData.as::get tileSizeX()
    get tileSizeX(): number
    {
        return this._tileSizeX;
    }

    // AS3: sources/win63_version/habbo/session/furniture/FurnitureData.as::get tileSizeY()
    get tileSizeY(): number
    {
        return this._tileSizeY;
    }

    // AS3: sources/win63_version/habbo/session/furniture/FurnitureData.as::get tileSizeZ()
    get tileSizeZ(): number
    {
        return this._tileSizeZ;
    }

    // AS3: sources/win63_version/habbo/session/furniture/FurnitureData.as::get colours()
    get colours(): number[] | null
    {
        return this._colours;
    }

    // AS3: sources/win63_version/habbo/session/furniture/FurnitureData.as::get localizedName()
    get localizedName(): string
    {
        return this._localizedName;
    }

    // AS3: sources/win63_version/habbo/session/furniture/FurnitureData.as::get description()
    get description(): string
    {
        return this._description;
    }

    // AS3: sources/win63_version/habbo/session/furniture/FurnitureData.as::get adUrl()
    get adUrl(): string
    {
        return this._adUrl;
    }

    // AS3: sources/win63_version/habbo/session/furniture/FurnitureData.as::get purchaseOfferId()
    get purchaseOfferId(): number
    {
        return this._purchaseOfferId;
    }

    // AS3: sources/win63_version/habbo/session/furniture/FurnitureData.as::get bcOfferId()
    get bcOfferId(): number
    {
        return this._bcOfferId;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/session/furniture/FurnitureData.as::get tradeable()
    get tradeable(): boolean
    {
        return this._tradeable;
    }

    // AS3: sources/win63_version/habbo/session/furniture/FurnitureData.as::get rentOfferId()
    get rentOfferId(): number
    {
        return this._rentOfferId;
    }

    // AS3: sources/win63_version/habbo/session/furniture/FurnitureData.as::get customParams()
    get customParams(): string | null
    {
        return this._customParams;
    }

    // AS3: sources/win63_version/habbo/session/furniture/FurnitureData.as::get category()
    get category(): number
    {
        return this._category;
    }

    // AS3: sources/win63_version/habbo/session/furniture/FurnitureData.as::get purchaseCouldBeUsedForBuyout()
    get purchaseCouldBeUsedForBuyout(): boolean
    {
        return this._purchaseCouldBeUsedForBuyout;
    }

    // AS3: sources/win63_version/habbo/session/furniture/FurnitureData.as::get rentCouldBeUsedForBuyout()
    get rentCouldBeUsedForBuyout(): boolean
    {
        return this._rentCouldBeUsedForBuyout;
    }

    // AS3: sources/win63_version/habbo/session/furniture/FurnitureData.as::get availableForBuildersClub()
    get availableForBuildersClub(): boolean
    {
        return this._availableForBuildersClub;
    }

    // AS3: sources/win63_version/habbo/session/furniture/FurnitureData.as::get canStandOn()
    get canStandOn(): boolean
    {
        return this._canStandOn;
    }

    // AS3: sources/win63_version/habbo/session/furniture/FurnitureData.as::get canSitOn()
    get canSitOn(): boolean
    {
        return this._canSitOn;
    }

    // AS3: sources/win63_version/habbo/session/furniture/FurnitureData.as::get canLayOn()
    get canLayOn(): boolean
    {
        return this._canLayOn;
    }

    // AS3: sources/win63_version/habbo/session/furniture/FurnitureData.as::get isExternalImageType()
    get isExternalImageType(): boolean
    {
        return this._className.indexOf('external_image') !== -1;
    }

    // AS3: sources/win63_version/habbo/session/furniture/FurnitureData.as::get excludedFromDynamic()
    get excludedFromDynamic(): boolean
    {
        return this._excludedFromDynamic;
    }

    // AS3: sources/win63_version/habbo/session/furniture/FurnitureData.as::get furniLine()
    get furniLine(): string
    {
        return this._furniLine;
    }
}

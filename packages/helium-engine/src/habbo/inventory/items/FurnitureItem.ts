import type {IFurnitureItem} from './IFurnitureItem';
import type {IStuffData} from '@habbo/room/object/data/IStuffData';
import type {IFurnitureItemData} from './FurnitureItemData';

/**
 * Furniture item data model
 *
 * Based on AS3 com.sulake.habbo.inventory.items.FurnitureItem
 */
export class FurnitureItem implements IFurnitureItem
{
    private _expirationTimeStamp: number;

    constructor(data: IFurnitureItemData)
    {
        this._id = data.itemId;
        this._ref = data.roomItemId;
        this._type = data.itemTypeId;
        this._category = data.category;
        this._stuffData = data.stuffData;
        this._extra = data.extra;
        this._recyclable = data.isRecyclable;
        this._tradeable = data.isTradeable;
        this._groupable = data.isGroupable && !data.isRented;
        this._sellable = data.isSellable;
        this._isWallItem = data.isWallItem;
        this._isRented = data.isRented;
        this._secondsToExpiration = data.secondsToExpiration;
        this._expirationTimeStamp = data.expirationTimeStamp;
        this._hasRentPeriodStarted = data.hasRentPeriodStarted;
        this._flatId = data.flatId;
        this._slotId = data.slotId;
        this._songId = data.songId;
        this._creationDay = data.creationDay;
        this._creationMonth = data.creationMonth;
        this._creationYear = data.creationYear;
    }

    private _id: number;

    get id(): number
    {
        return this._id;
    }

    private _ref: number;

    get ref(): number
    {
        return this._ref;
    }

    private _type: number;

    get type(): number
    {
        return this._type;
    }

    private _category: number;

    get category(): number
    {
        return this._category;
    }

    private _stuffData: IStuffData | null;

    get stuffData(): IStuffData | null
    {
        return this._stuffData;
    }

    set stuffData(value: IStuffData | null)
    {
        this._stuffData = value;
    }

    private _extra: number;

    get extra(): number
    {
        return this._extra;
    }

    private _recyclable: boolean;

    get recyclable(): boolean
    {
        return this._recyclable;
    }

    private _tradeable: boolean;

    get tradeable(): boolean
    {
        return this._tradeable;
    }

    private _groupable: boolean;

    get groupable(): boolean
    {
        return this._groupable;
    }

    private _sellable: boolean;

    get sellable(): boolean
    {
        return this._sellable;
    }

    private _isWallItem: boolean;

    get isWallItem(): boolean
    {
        return this._isWallItem;
    }

    private _isRented: boolean;

    get isRented(): boolean
    {
        return this._isRented;
    }

    private _secondsToExpiration: number;

    /**
	 * Get seconds until expiration
	 * Calculates remaining time if rent period has started
	 */
    get secondsToExpiration(): number
    {
        if(this._secondsToExpiration === -1)
        {
            return -1;
        }

        if(this._hasRentPeriodStarted)
        {
            const elapsed = (Date.now() - this._expirationTimeStamp) / 1000;
            const remaining = this._secondsToExpiration - elapsed;

            return Math.max(0, Math.floor(remaining));
        }

        return this._secondsToExpiration;
    }

    private _hasRentPeriodStarted: boolean;

    get hasRentPeriodStarted(): boolean
    {
        return this._hasRentPeriodStarted;
    }

    private _locked: boolean = false;

    get locked(): boolean
    {
        return this._locked;
    }

    set locked(value: boolean)
    {
        this._locked = value;
    }

    private _flatId: number;

    get flatId(): number
    {
        return this._flatId;
    }

    private _slotId: string;

    get slotId(): string
    {
        return this._slotId;
    }

    private _songId: number;

    get songId(): number
    {
        return this._songId;
    }

    private _creationDay: number;

    get creationDay(): number
    {
        return this._creationDay;
    }

    private _creationMonth: number;

    get creationMonth(): number
    {
        return this._creationMonth;
    }

    private _creationYear: number;

    get creationYear(): number
    {
        return this._creationYear;
    }

    /**
	 * Update item from new data
	 */
    update(data: IFurnitureItemData): void
    {
        this._ref = data.roomItemId;
        this._type = data.itemTypeId;
        this._category = data.category;
        this._stuffData = data.stuffData;
        this._extra = data.extra;
        this._recyclable = data.isRecyclable;
        this._tradeable = data.isTradeable;
        this._groupable = data.isGroupable && !data.isRented;
        this._sellable = data.isSellable;
        this._isWallItem = data.isWallItem;
        this._isRented = data.isRented;
        this._secondsToExpiration = data.secondsToExpiration;
        this._expirationTimeStamp = data.expirationTimeStamp;
        this._hasRentPeriodStarted = data.hasRentPeriodStarted;
        this._flatId = data.flatId;
        this._slotId = data.slotId;
        this._songId = data.songId;
        this._creationDay = data.creationDay;
        this._creationMonth = data.creationMonth;
        this._creationYear = data.creationYear;
    }
}

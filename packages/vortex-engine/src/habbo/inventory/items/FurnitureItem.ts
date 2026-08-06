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

    // AS3: .../src/com/sulake/habbo/inventory/items/FurnitureItem.as::get id()
    get id(): number
    {
        return this._id;
    }

    private _ref: number;

    // AS3: .../src/com/sulake/habbo/inventory/items/FurnitureItem.as::get ref()
    get ref(): number
    {
        return this._ref;
    }

    private _type: number;

    // AS3: .../src/com/sulake/habbo/inventory/items/FurnitureItem.as::get type()
    get type(): number
    {
        return this._type;
    }

    private _category: number;

    // AS3: .../src/com/sulake/habbo/inventory/items/FurnitureItem.as::get category()
    get category(): number
    {
        return this._category;
    }

    private _stuffData: IStuffData | null;

    // AS3: .../src/com/sulake/habbo/inventory/items/FurnitureItem.as::get stuffData()
    get stuffData(): IStuffData | null
    {
        return this._stuffData;
    }

    // AS3: .../src/com/sulake/habbo/inventory/items/FurnitureItem.as::set stuffData()
    set stuffData(value: IStuffData | null)
    {
        this._stuffData = value;
    }

    private _extra: number;

    // AS3: .../src/com/sulake/habbo/inventory/items/FurnitureItem.as::get extra()
    get extra(): number
    {
        return this._extra;
    }

    private _recyclable: boolean;

    // AS3: .../src/com/sulake/habbo/inventory/items/FurnitureItem.as::get recyclable()
    get recyclable(): boolean
    {
        return this._recyclable;
    }

    private _tradeable: boolean;

    // AS3: .../src/com/sulake/habbo/inventory/items/FurnitureItem.as::get tradeable()
    get tradeable(): boolean
    {
        return this._tradeable;
    }

    private _groupable: boolean;

    // AS3: .../src/com/sulake/habbo/inventory/items/FurnitureItem.as::get groupable()
    get groupable(): boolean
    {
        return this._groupable;
    }

    private _sellable: boolean;

    // AS3: .../src/com/sulake/habbo/inventory/items/FurnitureItem.as::get sellable()
    get sellable(): boolean
    {
        return this._sellable;
    }

    private _isWallItem: boolean;

    // AS3: .../src/com/sulake/habbo/inventory/items/FurnitureItem.as::get isWallItem()
    get isWallItem(): boolean
    {
        return this._isWallItem;
    }

    private _isRented: boolean;

    // AS3: .../src/com/sulake/habbo/inventory/items/FurnitureItem.as::get isRented()
    get isRented(): boolean
    {
        return this._isRented;
    }

    private _secondsToExpiration: number;

    /**
	 * Get seconds until expiration
	 * Calculates remaining time if rent period has started
	 */
    // AS3: .../src/com/sulake/habbo/inventory/items/FurnitureItem.as::get secondsToExpiration()
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

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/items/FurnitureItem.as::get expirationTimeStamp()
    get expirationTimeStamp(): number
    {
        return this._expirationTimeStamp;
    }

    private _hasRentPeriodStarted: boolean;

    // AS3: .../src/com/sulake/habbo/inventory/items/FurnitureItem.as::get hasRentPeriodStarted()
    get hasRentPeriodStarted(): boolean
    {
        return this._hasRentPeriodStarted;
    }

    private _locked: boolean = false;

    // AS3: .../src/com/sulake/habbo/inventory/items/FurnitureItem.as::get locked()
    get locked(): boolean
    {
        return this._locked;
    }

    // AS3: .../src/com/sulake/habbo/inventory/items/FurnitureItem.as::set locked()
    set locked(value: boolean)
    {
        this._locked = value;
    }

    // AS3: .../src/com/sulake/habbo/inventory/items/FurnitureItem.as::_flatId
    private _flatId: number;

    // AS3: .../src/com/sulake/habbo/inventory/items/FurnitureItem.as::get flatId()
    get flatId(): number
    {
        return this._flatId;
    }

    private _slotId: string | null;

    // AS3: .../src/com/sulake/habbo/inventory/items/FurnitureItem.as::get slotId()
    get slotId(): string | null
    {
        return this._slotId;
    }

    private _songId: number;

    // AS3: .../src/com/sulake/habbo/inventory/items/FurnitureItem.as::get songId()
    get songId(): number
    {
        return this._songId;
    }

    private _creationDay: number;

    // AS3: .../src/com/sulake/habbo/inventory/items/FurnitureItem.as::get creationDay()
    get creationDay(): number
    {
        return this._creationDay;
    }

    // AS3: .../src/com/sulake/habbo/inventory/items/FurnitureItem.as::_creationMonth
    private _creationMonth: number;

    // AS3: .../src/com/sulake/habbo/inventory/items/FurnitureItem.as::get creationMonth()
    get creationMonth(): number
    {
        return this._creationMonth;
    }

    private _creationYear: number;

    // AS3: .../src/com/sulake/habbo/inventory/items/FurnitureItem.as::get creationYear()
    get creationYear(): number
    {
        return this._creationYear;
    }

    /**
	 * Update item from new data
	 */
    // AS3: .../src/com/sulake/habbo/inventory/items/FurnitureItem.as::update()
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

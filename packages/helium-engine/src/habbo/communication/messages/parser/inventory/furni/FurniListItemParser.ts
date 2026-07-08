import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IStuffData} from '@habbo/inventory/items/IStuffData';
import type {IFurnitureItemData} from '@habbo/inventory/items/FurnitureItemData';
import {StuffDataFactory} from '@habbo/inventory/items/stuffdata';

/**
 * Parser for a single furniture item in inventory
 *
 * @see source_as_win63/habbo/communication/messages/incoming/inventory/furni/class_1707.as
 */
export class FurniListItemParser
{
    private static readonly WALL_ITEM_TYPE = 'I';
    private static readonly FLOOR_ITEM_TYPE = 'S';

    constructor(wrapper: IMessageDataWrapper)
    {
        this.parse(wrapper);
    }

    private _itemId: number = 0;

    get itemId(): number
    {
        return this._itemId;
    }

    private _itemType: string = '';

    get itemType(): string
    {
        return this._itemType;
    }

    private _roomItemId: number = 0;

    get roomItemId(): number
    {
        return this._roomItemId;
    }

    private _itemTypeId: number = 0;

    get itemTypeId(): number
    {
        return this._itemTypeId;
    }

    private _category: number = 0;

    get category(): number
    {
        return this._category;
    }

    private _stuffData: IStuffData | null = null;

    get stuffData(): IStuffData | null
    {
        return this._stuffData;
    }

    private _isRecyclable: boolean = false;

    get isRecyclable(): boolean
    {
        return this._isRecyclable;
    }

    private _isTradeable: boolean = false;

    get isTradeable(): boolean
    {
        return this._isTradeable;
    }

    private _isGroupable: boolean = false;

    get isGroupable(): boolean
    {
        return this._isGroupable;
    }

    private _isSellable: boolean = false;

    get isSellable(): boolean
    {
        return this._isSellable;
    }

    private _secondsToExpiration: number = -1;

    get secondsToExpiration(): number
    {
        return this._secondsToExpiration;
    }

    private _expirationTimeStamp: number = 0;

    get expirationTimeStamp(): number
    {
        return this._expirationTimeStamp;
    }

    private _isRented: boolean = false;

    get isRented(): boolean
    {
        return this._isRented;
    }

    private _hasRentPeriodStarted: boolean = false;

    get hasRentPeriodStarted(): boolean
    {
        return this._hasRentPeriodStarted;
    }

    private _flatId: number = 0;

    get flatId(): number
    {
        return this._flatId;
    }

    private _isWallItem: boolean = false;

    get isWallItem(): boolean
    {
        return this._isWallItem;
    }

    private _slotId: string = '';

    get slotId(): string
    {
        return this._slotId;
    }

    private _extra: number = 0;

    get extra(): number
    {
        return this._extra;
    }

    get isExternalImageFurni(): boolean
    {
        return this._itemType.indexOf('external_image') !== -1;
    }

    /**
	 * Convert to IFurnitureItemData for creating FurnitureItem
	 */
    toFurnitureItemData(): IFurnitureItemData
    {
        return {
            itemId: this._itemId,
            itemType: this._itemType,
            roomItemId: this._roomItemId,
            itemTypeId: this._itemTypeId,
            category: this._category,
            stuffData: this._stuffData,
            isGroupable: this._isGroupable,
            isRecyclable: this._isRecyclable,
            isTradeable: this._isTradeable,
            isSellable: this._isSellable,
            secondsToExpiration: this._secondsToExpiration,
            flatId: this._flatId,
            slotId: this._slotId,
            songId: 0,
            extra: this._extra,
            isRented: this._isRented,
            isWallItem: this._isWallItem,
            hasRentPeriodStarted: this._hasRentPeriodStarted,
            expirationTimeStamp: this._expirationTimeStamp,
            creationDay: 0,
            creationMonth: 0,
            creationYear: 0,
            isExternalImageFurni: this.isExternalImageFurni,
        };
    }

    private parse(wrapper: IMessageDataWrapper): void
    {
        this._itemId = wrapper.readInt();
        this._itemType = wrapper.readString();
        this._roomItemId = wrapper.readInt();
        this._itemTypeId = wrapper.readInt();
        this._category = wrapper.readInt();
        this._stuffData = StuffDataFactory.parseStuffData(wrapper);
        this._isRecyclable = wrapper.readBoolean();
        this._isTradeable = wrapper.readBoolean();
        this._isGroupable = wrapper.readBoolean();
        this._isSellable = wrapper.readBoolean();
        this._secondsToExpiration = wrapper.readInt();
        this._expirationTimeStamp = Date.now();

        if(this._secondsToExpiration > -1)
        {
            this._isRented = true;
        }
        else
        {
            this._isRented = false;
            this._secondsToExpiration = -1;
        }

        this._hasRentPeriodStarted = wrapper.readBoolean();
        this._flatId = wrapper.readInt();
        this._isWallItem = this._itemType === FurniListItemParser.WALL_ITEM_TYPE;

        if(this._itemType === FurniListItemParser.FLOOR_ITEM_TYPE)
        {
            this._slotId = wrapper.readString();
            this._extra = wrapper.readInt();
        }
    }
}

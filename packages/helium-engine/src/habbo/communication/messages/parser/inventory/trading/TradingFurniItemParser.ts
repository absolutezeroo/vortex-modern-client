import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IStuffData} from '@habbo/inventory/items/IStuffData';
import {StuffDataFactory} from '@habbo/inventory/items/stuffdata';

/**
 * Parser for a single item within a trade offer.
 *
 * Distinct field layout from FurniListItemParser (regular inventory furni list) —
 * trading items carry creation-date fields instead of the tradeable/sellable/
 * rent-period flags.
 *
 * @see sources/win63_version/habbo/communication/messages/incoming/inventory/trading/class_3066.as
 */
export class TradingFurniItemParser
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

    private _extra: number = -1;

    get extra(): number
    {
        return this._extra;
    }

    get songId(): number
    {
        return this._extra;
    }

    private _secondsToExpiration: number = -1;

    get secondsToExpiration(): number
    {
        return this._secondsToExpiration;
    }

    private _creationDay: number = 0;

    get creationDay(): number
    {
        return this._creationDay;
    }

    private _creationMonth: number = 0;

    get creationMonth(): number
    {
        return this._creationMonth;
    }

    private _creationYear: number = 0;

    get creationYear(): number
    {
        return this._creationYear;
    }

    private _isGroupable: boolean = false;

    get isGroupable(): boolean
    {
        return this._isGroupable;
    }

    private _flatId: number = -1;

    get flatId(): number
    {
        return this._flatId;
    }

    get isRented(): boolean
    {
        return false;
    }

    get isWallItem(): boolean
    {
        return this._itemType === TradingFurniItemParser.WALL_ITEM_TYPE;
    }

    get hasRentPeriodStarted(): boolean
    {
        return false;
    }

    private _expirationTimeStamp: number = 0;

    get expirationTimeStamp(): number
    {
        return this._expirationTimeStamp;
    }

    get isRecyclable(): boolean
    {
        return true;
    }

    get isTradeable(): boolean
    {
        return true;
    }

    get isSellable(): boolean
    {
        return true;
    }

    get slotId(): string | null
    {
        return null;
    }

    get isExternalImageFurni(): boolean
    {
        return this._itemType.indexOf('external_image') !== -1;
    }

    private parse(wrapper: IMessageDataWrapper): void
    {
        this._itemId = wrapper.readInt();
        this._itemType = wrapper.readString().toUpperCase();
        this._roomItemId = wrapper.readInt();
        this._itemTypeId = wrapper.readInt();
        this._category = wrapper.readInt();
        this._isGroupable = wrapper.readBoolean();
        this._stuffData = StuffDataFactory.parseStuffData(wrapper);
        this._secondsToExpiration = -1;
        this._expirationTimeStamp = Date.now();
        this._creationDay = wrapper.readInt();
        this._creationMonth = wrapper.readInt();
        this._creationYear = wrapper.readInt();
        this._extra = this._itemType === TradingFurniItemParser.FLOOR_ITEM_TYPE ? wrapper.readInt() : -1;
    }
}

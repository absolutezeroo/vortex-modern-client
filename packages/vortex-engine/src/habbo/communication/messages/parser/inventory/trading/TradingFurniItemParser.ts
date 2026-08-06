import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IStuffData} from '@habbo/room/object/data/IStuffData';
import {StuffDataFactory} from '@habbo/room/object/data';

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

    // AS3: sources/win63_version/habbo/communication/messages/incoming/inventory/trading/class_3066.as::get itemId()
    get itemId(): number
    {
        return this._itemId;
    }

    private _itemType: string = '';

    // AS3: sources/win63_version/habbo/communication/messages/incoming/inventory/trading/class_3066.as::get itemType()
    get itemType(): string
    {
        return this._itemType;
    }

    private _roomItemId: number = 0;

    // AS3: sources/win63_version/habbo/communication/messages/incoming/inventory/trading/class_3066.as::get roomItemId()
    get roomItemId(): number
    {
        return this._roomItemId;
    }

    private _itemTypeId: number = 0;

    // AS3: sources/win63_version/habbo/communication/messages/incoming/inventory/trading/class_3066.as::get itemTypeId()
    get itemTypeId(): number
    {
        return this._itemTypeId;
    }

    private _category: number = 0;

    // AS3: sources/win63_version/habbo/communication/messages/incoming/inventory/trading/class_3066.as::get category()
    get category(): number
    {
        return this._category;
    }

    private _stuffData: IStuffData | null = null;

    // AS3: sources/win63_version/habbo/communication/messages/incoming/inventory/trading/class_3066.as::get stuffData()
    get stuffData(): IStuffData | null
    {
        return this._stuffData;
    }

    private _extra: number = -1;

    // AS3: sources/win63_version/habbo/communication/messages/incoming/inventory/trading/class_3066.as::get extra()
    get extra(): number
    {
        return this._extra;
    }

    // AS3: sources/win63_version/habbo/communication/messages/incoming/inventory/trading/class_3066.as::get songId()
    get songId(): number
    {
        return this._extra;
    }

    private _secondsToExpiration: number = -1;

    // AS3: sources/win63_version/habbo/communication/messages/incoming/inventory/trading/class_3066.as::get secondsToExpiration()
    get secondsToExpiration(): number
    {
        return this._secondsToExpiration;
    }

    private _creationDay: number = 0;

    // AS3: sources/win63_version/habbo/communication/messages/incoming/inventory/trading/class_3066.as::get creationDay()
    get creationDay(): number
    {
        return this._creationDay;
    }

    // AS3: sources/win63_version/habbo/communication/messages/incoming/inventory/trading/class_3066.as::_creationMonth
    private _creationMonth: number = 0;

    // AS3: sources/win63_version/habbo/communication/messages/incoming/inventory/trading/class_3066.as::get creationMonth()
    get creationMonth(): number
    {
        return this._creationMonth;
    }

    private _creationYear: number = 0;

    // AS3: sources/win63_version/habbo/communication/messages/incoming/inventory/trading/class_3066.as::get creationYear()
    get creationYear(): number
    {
        return this._creationYear;
    }

    private _isGroupable: boolean = false;

    // AS3: sources/win63_version/habbo/communication/messages/incoming/inventory/trading/class_3066.as::get isGroupable()
    get isGroupable(): boolean
    {
        return this._isGroupable;
    }

    // AS3: sources/win63_version/habbo/communication/messages/incoming/inventory/trading/class_3066.as::_flatId
    private _flatId: number = -1;

    // AS3: sources/win63_version/habbo/communication/messages/incoming/inventory/trading/class_3066.as::get flatId()
    get flatId(): number
    {
        return this._flatId;
    }

    // AS3: sources/win63_version/habbo/communication/messages/incoming/inventory/trading/class_3066.as::get isRented()
    get isRented(): boolean
    {
        return false;
    }

    // AS3: sources/win63_version/habbo/communication/messages/incoming/inventory/trading/class_3066.as::get isWallItem()
    get isWallItem(): boolean
    {
        return this._itemType === TradingFurniItemParser.WALL_ITEM_TYPE;
    }

    // AS3: sources/win63_version/habbo/communication/messages/incoming/inventory/trading/class_3066.as::get hasRentPeriodStarted()
    get hasRentPeriodStarted(): boolean
    {
        return false;
    }

    private _expirationTimeStamp: number = 0;

    // AS3: sources/win63_version/habbo/communication/messages/incoming/inventory/trading/class_3066.as::get expirationTimeStamp()
    get expirationTimeStamp(): number
    {
        return this._expirationTimeStamp;
    }

    // AS3: sources/win63_version/habbo/communication/messages/incoming/inventory/trading/class_3066.as::get isRecyclable()
    get isRecyclable(): boolean
    {
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/incoming/inventory/trading/class_3066.as::get isTradeable()
    get isTradeable(): boolean
    {
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/incoming/inventory/trading/class_3066.as::get isSellable()
    get isSellable(): boolean
    {
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/incoming/inventory/trading/class_3066.as::get slotId()
    get slotId(): string | null
    {
        return null;
    }

    // AS3: sources/win63_version/habbo/communication/messages/incoming/inventory/trading/class_3066.as::get isExternalImageFurni()
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
        // AS3 reads the format int, builds the wrapper, then initializes it from the same
        // wrapper — two calls, never a combined helper. Read order is unchanged.
        this._stuffData = StuffDataFactory.getStuffDataForType(wrapper.readInt());
        this._stuffData?.initializeFromIncomingMessage(wrapper);
        this._secondsToExpiration = -1;
        this._expirationTimeStamp = Date.now();
        this._creationDay = wrapper.readInt();
        this._creationMonth = wrapper.readInt();
        this._creationYear = wrapper.readInt();
        this._extra = this._itemType === TradingFurniItemParser.FLOOR_ITEM_TYPE ? wrapper.readInt() : -1;
    }
}

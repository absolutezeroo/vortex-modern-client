import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Data class for a catalog product in club gift selection
 *
 * Parses product type and associated item data from the wrapper.
 *
 * @see source_as_win63/habbo/communication/messages/incoming/catalog/class_1718.as
 */
export class ClubGiftProductData
{
    public static readonly PRODUCT_TYPE_ITEM: string = 'i';
    public static readonly PRODUCT_TYPE_STUFF: string = 's';
    public static readonly PRODUCT_TYPE_EFFECT: string = 'e';
    public static readonly PRODUCT_TYPE_BADGE: string = 'b';

    constructor(wrapper: IMessageDataWrapper)
    {
        this._productType = wrapper.readString();

        if(this._productType !== ClubGiftProductData.PRODUCT_TYPE_BADGE)
        {
            this._furniClassId = wrapper.readInt();
            this._extraParam = wrapper.readString();
            this._productCount = wrapper.readInt();
            this._uniqueLimitedItem = wrapper.readBoolean();

            if(this._uniqueLimitedItem)
            {
                this._uniqueLimitedItemSeriesSize = wrapper.readInt();
                this._uniqueLimitedItemsLeft = wrapper.readInt();
            }
        }
        else
        {
            this._extraParam = wrapper.readString();
            this._productCount = 1;
        }
    }

    private _productType: string = '';

    get productType(): string
    {
        return this._productType;
    }

    private _furniClassId: number = 0;

    get furniClassId(): number
    {
        return this._furniClassId;
    }

    private _extraParam: string = '';

    get extraParam(): string
    {
        return this._extraParam;
    }

    private _productCount: number = 0;

    get productCount(): number
    {
        return this._productCount;
    }

    private _uniqueLimitedItem: boolean = false;

    get uniqueLimitedItem(): boolean
    {
        return this._uniqueLimitedItem;
    }

    private _uniqueLimitedItemSeriesSize: number = 0;

    get uniqueLimitedItemSeriesSize(): number
    {
        return this._uniqueLimitedItemSeriesSize;
    }

    private _uniqueLimitedItemsLeft: number = 0;

    get uniqueLimitedItemsLeft(): number
    {
        return this._uniqueLimitedItemsLeft;
    }
}

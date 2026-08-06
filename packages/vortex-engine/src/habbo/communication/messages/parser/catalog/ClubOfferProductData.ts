import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * A single product entry within a club gift offer.
 *
 * @see sources/win63_version/habbo/communication/messages/incoming/catalog/class_2104.as
 */
export class ClubOfferProductData
{
    // AS3: sources/win63_version/habbo/communication/messages/incoming/catalog/class_2104.as::PRODUCT_TYPE_ITEM
    static readonly PRODUCT_TYPE_ITEM: string = 'i';
    // AS3: sources/win63_version/habbo/communication/messages/incoming/catalog/class_2104.as::PRODUCT_TYPE_STUFF
    static readonly PRODUCT_TYPE_STUFF: string = 's';
    // AS3: sources/win63_version/habbo/communication/messages/incoming/catalog/class_2104.as::PRODUCT_TYPE_EFFECT
    static readonly PRODUCT_TYPE_EFFECT: string = 'e';
    // AS3: sources/win63_version/habbo/communication/messages/incoming/catalog/class_2104.as::PRODUCT_TYPE_BADGE
    static readonly PRODUCT_TYPE_BADGE: string = 'b';

    private _productType: string = '';

    // AS3: sources/win63_version/habbo/communication/messages/incoming/catalog/class_2104.as::get productType()
    get productType(): string
    {
        return this._productType;
    }

    private _furniClassId: number = 0;

    // AS3: sources/win63_version/habbo/communication/messages/incoming/catalog/class_2104.as::get furniClassId()
    get furniClassId(): number
    {
        return this._furniClassId;
    }

    private _extraParam: string = '';

    // AS3: sources/win63_version/habbo/communication/messages/incoming/catalog/class_2104.as::get extraParam()
    get extraParam(): string
    {
        return this._extraParam;
    }

    private _productCount: number = 0;

    // AS3: sources/win63_version/habbo/communication/messages/incoming/catalog/class_2104.as::get productCount()
    get productCount(): number
    {
        return this._productCount;
    }

    private _uniqueLimitedItem: boolean = false;

    // AS3: sources/win63_version/habbo/communication/messages/incoming/catalog/class_2104.as::get uniqueLimitedItem()
    get uniqueLimitedItem(): boolean
    {
        return this._uniqueLimitedItem;
    }

    private _uniqueLimitedItemSeriesSize: number = 0;

    // AS3: sources/win63_version/habbo/communication/messages/incoming/catalog/class_2104.as::get uniqueLimitedItemSeriesSize()
    get uniqueLimitedItemSeriesSize(): number
    {
        return this._uniqueLimitedItemSeriesSize;
    }

    private _uniqueLimitedItemsLeft: number = 0;

    // AS3: sources/win63_version/habbo/communication/messages/incoming/catalog/class_2104.as::get uniqueLimitedItemsLeft()
    get uniqueLimitedItemsLeft(): number
    {
        return this._uniqueLimitedItemsLeft;
    }

    constructor(wrapper: IMessageDataWrapper)
    {
        this._productType = wrapper.readString();

        if(this._productType !== ClubOfferProductData.PRODUCT_TYPE_BADGE)
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
}

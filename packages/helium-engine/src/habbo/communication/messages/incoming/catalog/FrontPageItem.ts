import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * A single front-page promo item slot (catalog landing page).
 *
 * @see sources/win63_version/habbo/communication/messages/incoming/catalog/class_1933.as
 */
export class FrontPageItem
{
    static readonly TYPE_PAGE: number = 0;
    static readonly TYPE_OFFER: number = 1;
    static readonly TYPE_PRODUCT_CODE: number = 2;

    private _position: number = 0;

    get position(): number
    {
        return this._position;
    }

    private _itemName: string = '';

    get itemName(): string
    {
        return this._itemName;
    }

    private _itemPromoImage: string = '';

    get itemPromoImage(): string
    {
        return this._itemPromoImage;
    }

    private _type: number = 0;

    get type(): number
    {
        return this._type;
    }

    private _cataloguePageLocation: string = '';

    get cataloguePageLocation(): string
    {
        return this._cataloguePageLocation;
    }

    private _productOfferID: number = 0;

    get productOfferID(): number
    {
        return this._productOfferID;
    }

    private _productCode: string = '';

    get productCode(): string
    {
        return this._productCode;
    }

    private _expirationTime: number = 0;

    get offerExpires(): boolean
    {
        return this._expirationTime > 0;
    }

    get secondsToExpiration(): number
    {
        return this._expirationTime - performance.now();
    }

    constructor(wrapper: IMessageDataWrapper | null)
    {
        if(!wrapper) return;

        this._position = wrapper.readInt();
        this._itemName = wrapper.readString();
        this._itemPromoImage = wrapper.readString();
        this._type = wrapper.readInt();

        switch(this._type)
        {
            case FrontPageItem.TYPE_PAGE:
                this._cataloguePageLocation = wrapper.readString();
                break;
            case FrontPageItem.TYPE_OFFER:
                this._productOfferID = wrapper.readInt();
                break;
            case FrontPageItem.TYPE_PRODUCT_CODE:
                this._productCode = wrapper.readString();
                break;
        }

        const expirationSeconds = wrapper.readInt();

        this._expirationTime = expirationSeconds > 0 ? expirationSeconds * 1000 + performance.now() : 0;
    }
}

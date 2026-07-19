import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {ClubOfferProductData} from '../../parser/catalog/ClubOfferProductData';

/**
 * The purchased offer's data, echoed back on a successful catalog purchase.
 *
 * @see sources/win63_version/habbo/communication/messages/incoming/catalog/class_2681.as
 */
export class PurchaseOKMessageOfferData
{
    private _offerId: number = 0;

    get offerId(): number
    {
        return this._offerId;
    }

    private _localizationId: string = '';

    get localizationId(): string
    {
        return this._localizationId;
    }

    private _isRent: boolean = false;

    get isRent(): boolean
    {
        return this._isRent;
    }

    private _priceInCredits: number = 0;

    get priceInCredits(): number
    {
        return this._priceInCredits;
    }

    private _priceInActivityPoints: number = 0;

    get priceInActivityPoints(): number
    {
        return this._priceInActivityPoints;
    }

    private _activityPointType: number = 0;

    get activityPointType(): number
    {
        return this._activityPointType;
    }

    private _giftable: boolean = false;

    get giftable(): boolean
    {
        return this._giftable;
    }

    private _products: ClubOfferProductData[] = [];

    get products(): ClubOfferProductData[]
    {
        return this._products;
    }

    private _clubLevel: number = 0;

    get clubLevel(): number
    {
        return this._clubLevel;
    }

    private _bundlePurchaseAllowed: boolean = false;

    get bundlePurchaseAllowed(): boolean
    {
        return this._bundlePurchaseAllowed;
    }

    constructor(wrapper: IMessageDataWrapper)
    {
        this._offerId = wrapper.readInt();
        this._localizationId = wrapper.readString();
        this._isRent = wrapper.readBoolean();
        this._priceInCredits = wrapper.readInt();
        this._priceInActivityPoints = wrapper.readInt();
        this._activityPointType = wrapper.readInt();
        this._giftable = wrapper.readBoolean();

        const productCount = wrapper.readInt();

        this._products = [];

        for(let i = 0; i < productCount; i++)
        {
            this._products.push(new ClubOfferProductData(wrapper));
        }

        this._clubLevel = wrapper.readInt();
        this._bundlePurchaseAllowed = wrapper.readBoolean();
    }
}

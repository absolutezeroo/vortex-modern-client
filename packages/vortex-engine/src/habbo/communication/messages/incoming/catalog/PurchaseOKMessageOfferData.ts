import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {ClubOfferProductData} from '../../parser/catalog/ClubOfferProductData';

/**
 * The purchased offer's data, echoed back on a successful catalog purchase.
 *
 * @see sources/win63_version/habbo/communication/messages/incoming/catalog/class_2681.as
 */
export class PurchaseOKMessageOfferData
{
    // AS3: sources/win63_version/habbo/communication/messages/incoming/catalog/class_2681.as::_offerId
    private _offerId: number = 0;

    // AS3: sources/win63_version/habbo/communication/messages/incoming/catalog/class_2681.as::get offerId()
    get offerId(): number
    {
        return this._offerId;
    }

    private _localizationId: string = '';

    // AS3: sources/win63_version/habbo/communication/messages/incoming/catalog/class_2681.as::get localizationId()
    get localizationId(): string
    {
        return this._localizationId;
    }

    private _isRent: boolean = false;

    // AS3: sources/win63_version/habbo/communication/messages/incoming/catalog/class_2681.as::get isRent()
    get isRent(): boolean
    {
        return this._isRent;
    }

    private _priceInCredits: number = 0;

    // AS3: sources/win63_version/habbo/communication/messages/incoming/catalog/class_2681.as::get priceInCredits()
    get priceInCredits(): number
    {
        return this._priceInCredits;
    }

    private _priceInActivityPoints: number = 0;

    // AS3: sources/win63_version/habbo/communication/messages/incoming/catalog/class_2681.as::get priceInActivityPoints()
    get priceInActivityPoints(): number
    {
        return this._priceInActivityPoints;
    }

    private _activityPointType: number = 0;

    // AS3: sources/win63_version/habbo/communication/messages/incoming/catalog/class_2681.as::get activityPointType()
    get activityPointType(): number
    {
        return this._activityPointType;
    }

    private _giftable: boolean = false;

    // AS3: sources/win63_version/habbo/communication/messages/incoming/catalog/class_2681.as::get giftable()
    get giftable(): boolean
    {
        return this._giftable;
    }

    private _products: ClubOfferProductData[] = [];

    // AS3: sources/win63_version/habbo/communication/messages/incoming/catalog/class_2681.as::get products()
    get products(): ClubOfferProductData[]
    {
        return this._products;
    }

    private _clubLevel: number = 0;

    // AS3: sources/win63_version/habbo/communication/messages/incoming/catalog/class_2681.as::get clubLevel()
    get clubLevel(): number
    {
        return this._clubLevel;
    }

    private _bundlePurchaseAllowed: boolean = false;

    // AS3: sources/win63_version/habbo/communication/messages/incoming/catalog/class_2681.as::get bundlePurchaseAllowed()
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

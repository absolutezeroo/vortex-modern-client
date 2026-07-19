import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {ClubOfferProductData} from './ClubOfferProductData';

/**
 * A single purchasable Habbo Club offer (e.g. shown on the club_gifts page).
 *
 * @see sources/win63_version/habbo/communication/messages/incoming/catalog/class_2138.as
 */
export class ClubOfferData
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

    private _priceInSilver: number = 0;

    get priceInSilver(): number
    {
        return this._priceInSilver;
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

    private _previewImage: string = '';

    get previewImage(): string
    {
        return this._previewImage;
    }

    constructor(wrapper: IMessageDataWrapper)
    {
        this._offerId = wrapper.readInt();
        this._localizationId = wrapper.readString();
        this._isRent = wrapper.readBoolean();
        this._priceInCredits = wrapper.readInt();
        this._priceInActivityPoints = wrapper.readInt();
        this._activityPointType = wrapper.readInt();
        this._priceInSilver = wrapper.readInt();
        this._giftable = wrapper.readBoolean();

        const productCount = wrapper.readInt();

        this._products = [];

        for(let i = 0; i < productCount; i++)
        {
            this._products.push(new ClubOfferProductData(wrapper));
        }

        this._clubLevel = wrapper.readInt();
        this._bundlePurchaseAllowed = wrapper.readBoolean();

        // AS3 reads a further boolean here (var_5190) that has no exposed getter
        // on class_2138 — kept as a wire-alignment read only, matching the source.
        wrapper.readBoolean();

        this._previewImage = wrapper.readString();
    }
}

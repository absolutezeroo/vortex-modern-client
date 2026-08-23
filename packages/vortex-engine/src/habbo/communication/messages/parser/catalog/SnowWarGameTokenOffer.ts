import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * One snow-war token bundle as the wire carries it.
 *
 * `clubLevel` and `giftable` are declared, exposed and never read from the buffer — AS3 leaves the
 * first at its default 0 and sets the second to `false` in the constructor. Both are kept because
 * the accessors exist and something may read them; neither is parsed, because the wire does not
 * send them.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1714/SnowWarGameTokenOffer.as
 */
export class SnowWarGameTokenOffer
{
    // AS3: SnowWarGameTokenOffer.as::_offerId
    private _offerId: number = 0;
    // AS3: SnowWarGameTokenOffer.as::_localizationId (from `get localizationId()`)
    private _localizationId: string = '';
    // AS3: SnowWarGameTokenOffer.as::_priceInCredits (from `get priceInCredits()`)
    private _priceInCredits: number = 0;
    // AS3: SnowWarGameTokenOffer.as::_priceInActivityPoints (from `get priceInActivityPoints()`)
    private _priceInActivityPoints: number = 0;
    // AS3: SnowWarGameTokenOffer.as::_activityPointType (from `get activityPointType()`)
    private _activityPointType: number = 0;
    // AS3: SnowWarGameTokenOffer.as::_clubLevel (from `get clubLevel()`) - never assigned
    private _clubLevel: number = 0;
    // AS3: SnowWarGameTokenOffer.as::_giftable (from `get giftable()`) - assigned false, never read
    private _giftable: boolean = false;

    // AS3: SnowWarGameTokenOffer.as::SnowWarGameTokenOffer()
    constructor(wrapper: IMessageDataWrapper)
    {
        this._offerId = wrapper.readInt();
        this._localizationId = wrapper.readString();
        this._priceInCredits = wrapper.readInt();
        this._priceInActivityPoints = wrapper.readInt();
        this._activityPointType = wrapper.readInt();
        this._giftable = false;
    }

    // AS3: SnowWarGameTokenOffer.as::get offerId()
    get offerId(): number
    {
        return this._offerId;
    }

    // AS3: SnowWarGameTokenOffer.as::get localizationId()
    get localizationId(): string
    {
        return this._localizationId;
    }

    // AS3: SnowWarGameTokenOffer.as::get priceInCredits()
    get priceInCredits(): number
    {
        return this._priceInCredits;
    }

    // AS3: SnowWarGameTokenOffer.as::get priceInActivityPoints()
    get priceInActivityPoints(): number
    {
        return this._priceInActivityPoints;
    }

    // AS3: SnowWarGameTokenOffer.as::get activityPointType()
    get activityPointType(): number
    {
        return this._activityPointType;
    }

    // AS3: SnowWarGameTokenOffer.as::get clubLevel()
    get clubLevel(): number
    {
        return this._clubLevel;
    }

    // AS3: SnowWarGameTokenOffer.as::get giftable()
    get giftable(): boolean
    {
        return this._giftable;
    }
}

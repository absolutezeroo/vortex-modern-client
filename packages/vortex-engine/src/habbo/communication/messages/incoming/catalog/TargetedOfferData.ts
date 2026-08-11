import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * One targeted offer, as the server sends it (header 2155).
 *
 * The class is obfuscated in every tree and did not exist in the 2016 PRODUCTION build, so the
 * name here is DERIVED; every *member* below is recovered, since AS3 does not obfuscate those.
 *
 * It lives on the message side rather than in `catalog/targetedoffers/data/` because that is where
 * AS3 puts it — the two classes that extend it (`TargetedOffer`, and the offer views' notion of a
 * mall offer) sit in the catalog package and import it from here, exactly as the source does.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1716/_SafeCls_3518.as
 */
export class TargetedOfferData
{
    // AS3: .../src/unknowns/_SafePkg_1716/_SafeCls_3518.as::_SafeStr_4872 (name from `get id()`)
    protected _id: number = 0;

    // AS3: .../src/unknowns/_SafePkg_1716/_SafeCls_3518.as::_SafeStr_7608 (name from `get identifier()`)
    protected _identifier: string = '';

    // AS3: .../src/unknowns/_SafePkg_1716/_SafeCls_3518.as::_SafeStr_4778 (name from `get type()`)
    protected _type: number = 0;

    // AS3: .../src/unknowns/_SafePkg_1716/_SafeCls_3518.as::_SafeStr_5263 (name from `get title()`)
    protected _title: string = '';

    // AS3: .../src/unknowns/_SafePkg_1716/_SafeCls_3518.as::_description
    protected _description: string = '';

    // AS3: .../src/unknowns/_SafePkg_1716/_SafeCls_3518.as::_SafeStr_4899 (name from `get imageUrl()`)
    protected _imageUrl: string = '';

    // AS3: .../src/unknowns/_SafePkg_1716/_SafeCls_3518.as::_SafeStr_7547 (name from `get iconImageUrl()`)
    protected _iconImageUrl: string = '';

    // AS3: .../src/unknowns/_SafePkg_1716/_SafeCls_3518.as::_productCode
    protected _productCode: string = '';

    // AS3: .../src/unknowns/_SafePkg_1716/_SafeCls_3518.as::_SafeStr_6454 (name from `get purchaseLimit()`)
    protected _purchaseLimit: number = 0;

    // AS3: .../src/unknowns/_SafePkg_1716/_SafeCls_3518.as::_expirationTime
    protected _expirationTime: number = 0;

    // AS3: .../src/unknowns/_SafePkg_1716/_SafeCls_3518.as::_SafeStr_6678 (name from `get priceInCredits()`)
    protected _priceInCredits: number = 0;

    // AS3: .../src/unknowns/_SafePkg_1716/_SafeCls_3518.as::_SafeStr_6823 (name from `get priceInActivityPoints()`)
    protected _priceInActivityPoints: number = 0;

    // AS3: .../src/unknowns/_SafePkg_1716/_SafeCls_3518.as::_SafeStr_7308 (name from `get activityPointType()`)
    protected _activityPointType: number = 0;

    // AS3: .../src/unknowns/_SafePkg_1716/_SafeCls_3518.as::_SafeStr_6647 (name from `get subProductCodes()`)
    protected _subProductCodes: string[] = [];

    // AS3: .../src/unknowns/_SafePkg_1716/_SafeCls_3518.as::_SafeStr_7563 (name from `get trackingState()`)
    protected _trackingState: number = 0;

    // AS3: .../src/unknowns/_SafePkg_1716/_SafeCls_3518.as::_SafeCls_3518()
    constructor(source: TargetedOfferData | null = null)
    {
        if(source == null) return;

        this._id = source.id;
        this._identifier = source.identifier;
        this._type = source.type;
        this._title = source.title;
        this._description = source.description;
        this._imageUrl = source.imageUrl;
        this._iconImageUrl = source.iconImageUrl;
        this._productCode = source.productCode;
        this._purchaseLimit = source.purchaseLimit;
        this._expirationTime = source.expirationTime;
        this._priceInCredits = source.priceInCredits;
        this._priceInActivityPoints = source.priceInActivityPoints;
        this._activityPointType = source.activityPointType;
        this._subProductCodes = source.subProductCodes;
        this._trackingState = source.trackingState;
    }

    /**
     * The expiry arrives as a *duration* in seconds and is immediately turned into an absolute
     * point on the client's own clock — `getTimer()` in AS3, `performance.now()` here. That is why
     * every later comparison is against the same clock and never against a wall date.
     */
    // AS3: .../src/unknowns/_SafePkg_1716/_SafeCls_3518.as::parse()
    parse(wrapper: IMessageDataWrapper): TargetedOfferData
    {
        this._trackingState = wrapper.readInt();
        this._id = wrapper.readInt();
        this._identifier = wrapper.readString();
        this._productCode = wrapper.readString();
        this._priceInCredits = wrapper.readInt();
        this._priceInActivityPoints = wrapper.readInt();
        this._activityPointType = wrapper.readInt();
        this._purchaseLimit = wrapper.readInt();

        const secondsUntilExpiry = wrapper.readInt();

        this._expirationTime = secondsUntilExpiry > 0 ? (secondsUntilExpiry * 1000) + performance.now() : 0;

        this._title = wrapper.readString();
        this._description = wrapper.readString();
        this._imageUrl = wrapper.readString();
        this._iconImageUrl = wrapper.readString();
        this._type = wrapper.readInt();

        this._subProductCodes = [];

        const subProductCount = wrapper.readInt();

        for(let i = 0; i < subProductCount; i++)
        {
            this._subProductCodes.push(wrapper.readString());
        }

        return this;
    }

    // AS3: .../src/unknowns/_SafePkg_1716/_SafeCls_3518.as::purchased()
    purchased(amount: number): void
    {
        this._purchaseLimit -= amount;
    }

    // AS3: .../src/unknowns/_SafePkg_1716/_SafeCls_3518.as::get id()
    get id(): number
    {
        return this._id;
    }

    // AS3: .../src/unknowns/_SafePkg_1716/_SafeCls_3518.as::get identifier()
    get identifier(): string
    {
        return this._identifier;
    }

    // AS3: .../src/unknowns/_SafePkg_1716/_SafeCls_3518.as::get type()
    get type(): number
    {
        return this._type;
    }

    // AS3: .../src/unknowns/_SafePkg_1716/_SafeCls_3518.as::get title()
    get title(): string
    {
        return this._title;
    }

    // AS3: .../src/unknowns/_SafePkg_1716/_SafeCls_3518.as::get description()
    get description(): string
    {
        return this._description;
    }

    // AS3: .../src/unknowns/_SafePkg_1716/_SafeCls_3518.as::get imageUrl()
    get imageUrl(): string
    {
        return this._imageUrl;
    }

    // AS3: .../src/unknowns/_SafePkg_1716/_SafeCls_3518.as::get iconImageUrl()
    get iconImageUrl(): string
    {
        return this._iconImageUrl;
    }

    // AS3: .../src/unknowns/_SafePkg_1716/_SafeCls_3518.as::get productCode()
    get productCode(): string
    {
        return this._productCode;
    }

    // AS3: .../src/unknowns/_SafePkg_1716/_SafeCls_3518.as::get purchaseLimit()
    get purchaseLimit(): number
    {
        return this._purchaseLimit;
    }

    // AS3: .../src/unknowns/_SafePkg_1716/_SafeCls_3518.as::get expirationTime()
    get expirationTime(): number
    {
        return this._expirationTime;
    }

    // AS3: .../src/unknowns/_SafePkg_1716/_SafeCls_3518.as::get priceInCredits()
    get priceInCredits(): number
    {
        return this._priceInCredits;
    }

    // AS3: .../src/unknowns/_SafePkg_1716/_SafeCls_3518.as::get priceInActivityPoints()
    get priceInActivityPoints(): number
    {
        return this._priceInActivityPoints;
    }

    // AS3: .../src/unknowns/_SafePkg_1716/_SafeCls_3518.as::get activityPointType()
    get activityPointType(): number
    {
        return this._activityPointType;
    }

    // AS3: .../src/unknowns/_SafePkg_1716/_SafeCls_3518.as::get subProductCodes()
    get subProductCodes(): string[]
    {
        return this._subProductCodes;
    }

    // AS3: .../src/unknowns/_SafePkg_1716/_SafeCls_3518.as::get trackingState()
    get trackingState(): number
    {
        return this._trackingState;
    }
}

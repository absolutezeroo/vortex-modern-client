import type {IStuffData} from '@habbo/room/object/data/IStuffData';
import type {IMarketPlaceOfferData} from './IMarketPlaceOfferData';

/**
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/MarketPlaceOfferData.as
 */
export class MarketPlaceOfferData implements IMarketPlaceOfferData
{
    private _offerId: number;

    private _furniId: number;

    private _furniType: number;

    private _extraData: string | null;

    private _stuffData: IStuffData | null;

    private _price: number;

    private _averagePrice: number;

    private _imageCallback: number = 0;

    private _status: number;

    private _timeLeftMinutes: number = -1;

    private _offerCount: number;

    private _image: ImageBitmap | null = null;

    private _statusTime: number = NaN;

    private _isUsable: boolean;

    private _isUsed: boolean;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/MarketPlaceOfferData.as::MarketPlaceOfferData()
    constructor(
        offerId: number, furniId: number, furniType: number, extraData: string | null, stuffData: IStuffData | null,
        price: number, status: number, averagePrice: number, offerCount: number = -1, isUsable: boolean = false, isUsed: boolean = false)
    {
        this._offerId = offerId;
        this._furniId = furniId;
        this._furniType = furniType;
        this._extraData = extraData;
        this._stuffData = stuffData;
        this._price = price;
        this._status = status;
        this._averagePrice = averagePrice;
        this._offerCount = offerCount;
        this._isUsable = isUsable;
        this._isUsed = isUsed;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/MarketPlaceOfferData.as::dispose()
    dispose(): void
    {
        this._image = null;
        this._stuffData = null;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/MarketPlaceOfferData.as::get offerId()
    get offerId(): number
    {
        return this._offerId;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/MarketPlaceOfferData.as::set offerId()
    set offerId(value: number)
    {
        this._offerId = value;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/MarketPlaceOfferData.as::get furniId()
    get furniId(): number
    {
        return this._furniId;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/MarketPlaceOfferData.as::get furniType()
    get furniType(): number
    {
        return this._furniType;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/MarketPlaceOfferData.as::get extraData()
    get extraData(): string | null
    {
        return this._extraData;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/MarketPlaceOfferData.as::get stuffData()
    get stuffData(): IStuffData | null
    {
        return this._stuffData;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/MarketPlaceOfferData.as::get price()
    get price(): number
    {
        return this._price;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/MarketPlaceOfferData.as::set price()
    set price(value: number)
    {
        this._price = value;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/MarketPlaceOfferData.as::get averagePrice()
    get averagePrice(): number
    {
        return this._averagePrice;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/MarketPlaceOfferData.as::get image()
    get image(): ImageBitmap | null
    {
        return this._image;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/MarketPlaceOfferData.as::set image()
    set image(value: ImageBitmap | null)
    {
        this._image = value;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/MarketPlaceOfferData.as::set imageCallback()
    set imageCallback(value: number)
    {
        this._imageCallback = value;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/MarketPlaceOfferData.as::get imageCallback()
    get imageCallback(): number
    {
        return this._imageCallback;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/MarketPlaceOfferData.as::get status()
    get status(): number
    {
        return this._status;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/MarketPlaceOfferData.as::get timeLeftMinutes()
    get timeLeftMinutes(): number
    {
        return this._timeLeftMinutes;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/MarketPlaceOfferData.as::set timeLeftMinutes()
    set timeLeftMinutes(value: number)
    {
        this._timeLeftMinutes = value;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/MarketPlaceOfferData.as::get statusTime()
    get statusTime(): number
    {
        return this._statusTime;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/MarketPlaceOfferData.as::set statusTime()
    set statusTime(value: number)
    {
        this._statusTime = value;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/MarketPlaceOfferData.as::get offerCount()
    get offerCount(): number
    {
        return this._offerCount;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/MarketPlaceOfferData.as::set offerCount()
    set offerCount(value: number)
    {
        this._offerCount = value;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/MarketPlaceOfferData.as::get isUniqueLimitedItem()
    get isUniqueLimitedItem(): boolean
    {
        return this._stuffData !== null && this._stuffData.uniqueSerialNumber > 0;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/MarketPlaceOfferData.as::get isUsable()
    get isUsable(): boolean
    {
        return this._isUsable;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/marketplace/MarketPlaceOfferData.as::get isUsed()
    get isUsed(): boolean
    {
        return this._isUsed;
    }
}

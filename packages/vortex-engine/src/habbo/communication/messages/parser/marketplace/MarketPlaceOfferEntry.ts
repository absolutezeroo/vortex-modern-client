import type {IStuffData} from '@habbo/room/object/data/IStuffData';

/**
 * Raw wire-transport shape for one offer entry, as read directly off the
 * socket by `MarketPlaceOffersEventParser`/`MarketPlaceOwnOffersEventParser`.
 * `MarketPlaceLogic.onOffers()`/`onOwnOffers()` re-project each entry's
 * fields into a domain `MarketPlaceOfferData` - the two-class split is
 * preserved faithfully from AS3 rather than collapsed into one class.
 *
 * TS-derived name: obfuscated with no readable-name counterpart in any of the
 * three source trees (WIN63-202607011411-782849652's `_SafeCls_2516`,
 * win63_version's `class_3020`, PRODUCTION-201601012205-226667486's `_Str_4192` are all
 * decompiler placeholders). Named from usage context: this is the per-offer
 * entry produced while parsing the offers list off the wire.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1899/_SafeCls_2516.as
 */
export class MarketPlaceOfferEntry 
{
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1899/_SafeCls_2516.as::_SafeCls_2516()
    constructor(
        offerId: number, furniId: number, furniType: number, extraData: string, stuffData: IStuffData | null,
        price: number, status: number, timeLeftMinutes: number, averagePrice: number, offerCount: number = -1,
        statusTime: number = NaN, isUsable: boolean = false, isUsed: boolean = false) 
    {
        this._offerId = offerId;
        this._furniId = furniId;
        this._furniType = furniType;
        this._extraData = extraData;
        this._stuffData = stuffData;
        this._price = price;
        this._status = status;
        this._timeLeftMinutes = timeLeftMinutes;
        this._averagePrice = averagePrice;
        this._offerCount = offerCount;
        this._statusTime = statusTime;
        this._isUsable = isUsable;
        this._isUsed = isUsed;
    }

    // AS3: .../src/unknowns/_SafePkg_1899/_SafeCls_2516.as::_offerId
    private _offerId: number;

    // AS3: .../src/unknowns/_SafePkg_1899/_SafeCls_2516.as::get offerId()
    get offerId(): number 
    {
        return this._offerId;
    }

    private _furniId: number;

    // AS3: .../src/unknowns/_SafePkg_1899/_SafeCls_2516.as::get furniId()
    get furniId(): number 
    {
        return this._furniId;
    }

    private _furniType: number;

    // AS3: .../src/unknowns/_SafePkg_1899/_SafeCls_2516.as::get furniType()
    get furniType(): number 
    {
        return this._furniType;
    }

    private _extraData: string;

    // AS3: .../src/unknowns/_SafePkg_1899/_SafeCls_2516.as::get extraData()
    get extraData(): string 
    {
        return this._extraData;
    }

    private _stuffData: IStuffData | null;

    // AS3: .../src/unknowns/_SafePkg_1899/_SafeCls_2516.as::get stuffData()
    get stuffData(): IStuffData | null 
    {
        return this._stuffData;
    }

    private _price: number;

    // AS3: .../src/unknowns/_SafePkg_1899/_SafeCls_2516.as::get price()
    get price(): number 
    {
        return this._price;
    }

    // AS3: .../src/unknowns/_SafePkg_1899/_SafeCls_2516.as::_status
    private _status: number;

    // AS3: .../src/unknowns/_SafePkg_1899/_SafeCls_2516.as::get status()
    get status(): number 
    {
        return this._status;
    }

    // AS3: .../src/unknowns/_SafePkg_1899/_SafeCls_2516.as::_timeLeftMinutes
    private _timeLeftMinutes: number;

    // AS3: .../src/unknowns/_SafePkg_1899/_SafeCls_2516.as::get timeLeftMinutes()
    get timeLeftMinutes(): number 
    {
        return this._timeLeftMinutes;
    }

    private _averagePrice: number;

    // AS3: .../src/unknowns/_SafePkg_1899/_SafeCls_2516.as::get averagePrice()
    get averagePrice(): number 
    {
        return this._averagePrice;
    }

    // AS3: .../src/unknowns/_SafePkg_1899/_SafeCls_2516.as::_offerCount
    private _offerCount: number;

    // AS3: .../src/unknowns/_SafePkg_1899/_SafeCls_2516.as::get offerCount()
    get offerCount(): number 
    {
        return this._offerCount;
    }

    // AS3: .../src/unknowns/_SafePkg_1899/_SafeCls_2516.as::_statusTime
    private _statusTime: number;

    // AS3: .../src/unknowns/_SafePkg_1899/_SafeCls_2516.as::get statusTime()
    get statusTime(): number 
    {
        return this._statusTime;
    }

    private _isUsable: boolean;

    // AS3: .../src/unknowns/_SafePkg_1899/_SafeCls_2516.as::get isUsable()
    get isUsable(): boolean 
    {
        return this._isUsable;
    }

    private _isUsed: boolean;

    // AS3: .../src/unknowns/_SafePkg_1899/_SafeCls_2516.as::get isUsed()
    get isUsed(): boolean 
    {
        return this._isUsed;
    }
}

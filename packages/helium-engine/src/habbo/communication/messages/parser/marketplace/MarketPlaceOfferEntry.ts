import type {IStuffData} from '@habbo/inventory/items/IStuffData';

/**
 * Raw wire-transport shape for one offer entry, as read directly off the
 * socket by `MarketPlaceOffersEventParser`/`MarketPlaceOwnOffersEventParser`.
 * `MarketPlaceLogic.onOffers()`/`onOwnOffers()` re-project each entry's
 * fields into a domain `MarketPlaceOfferData` - the two-class split is
 * preserved faithfully from AS3 rather than collapsed into one class.
 *
 * TS-derived name: obfuscated with no readable-name counterpart in any of the
 * three source trees (win63_2026_crypted_version's `_SafeCls_2516`,
 * win63_version's `class_3020`, flash_version's `_Str_4192` are all
 * decompiler placeholders). Named from usage context: this is the per-offer
 * entry produced while parsing the offers list off the wire.
 *
 * AS3: sources/win63_2026_crypted_version/src/unknowns/_SafePkg_1899/_SafeCls_2516.as
 */
export class MarketPlaceOfferEntry
{
    private _offerId: number;

    private _furniId: number;

    private _furniType: number;

    private _extraData: string;

    private _stuffData: IStuffData | null;

    private _price: number;

    private _status: number;

    private _timeLeftMinutes: number;

    private _averagePrice: number;

    private _offerCount: number;

    private _statusTime: number;

    private _isUsable: boolean;

    private _isUsed: boolean;

    // AS3: sources/win63_2026_crypted_version/src/unknowns/_SafePkg_1899/_SafeCls_2516.as::_SafeCls_2516()
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

    get offerId(): number
    {
        return this._offerId;
    }

    get furniId(): number
    {
        return this._furniId;
    }

    get furniType(): number
    {
        return this._furniType;
    }

    get extraData(): string
    {
        return this._extraData;
    }

    get stuffData(): IStuffData | null
    {
        return this._stuffData;
    }

    get price(): number
    {
        return this._price;
    }

    get status(): number
    {
        return this._status;
    }

    get timeLeftMinutes(): number
    {
        return this._timeLeftMinutes;
    }

    get averagePrice(): number
    {
        return this._averagePrice;
    }

    get offerCount(): number
    {
        return this._offerCount;
    }

    get statusTime(): number
    {
        return this._statusTime;
    }

    get isUsable(): boolean
    {
        return this._isUsable;
    }

    get isUsed(): boolean
    {
        return this._isUsed;
    }
}

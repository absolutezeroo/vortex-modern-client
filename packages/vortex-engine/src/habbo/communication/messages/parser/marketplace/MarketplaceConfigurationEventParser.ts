import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * @see sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1932/_SafeCls_1990.as
 * (real class name recovered from sources/win63_version/habbo/communication/messages/parser/marketplace/MarketplaceConfigurationEventParser.as)
 */
export class MarketplaceConfigurationEventParser implements IMessageParser
{
    private _isEnabled: boolean = false;

    private _commission: number = 0;

    private _tokenBatchPrice: number = 0;

    private _tokenBatchSize: number = 0;

    // AS3: .../src/unknowns/_SafePkg_1932/_SafeCls_1990.as::_offerMinPrice
    private _offerMinPrice: number = 0;

    // AS3: .../src/unknowns/_SafePkg_1932/_SafeCls_1990.as::_offerMaxPrice
    private _offerMaxPrice: number = 0;

    // AS3: .../src/unknowns/_SafePkg_1932/_SafeCls_1990.as::_expirationHours
    private _expirationHours: number = 0;

    private _averagePricePeriod: number = 0;

    private _sellingFeePercentage: number = 0;

    // AS3: .../src/unknowns/_SafePkg_1932/_SafeCls_1990.as::_revenueLimit
    private _revenueLimit: number = 0;

    // AS3: .../src/unknowns/_SafePkg_1932/_SafeCls_1990.as::_halfTaxLimit
    private _halfTaxLimit: number = 0;

    // AS3: .../src/unknowns/_SafePkg_1932/_SafeCls_1990.as::get isEnabled()
    get isEnabled(): boolean
    {
        return this._isEnabled;
    }

    // AS3: .../src/unknowns/_SafePkg_1932/_SafeCls_1990.as::get commission()
    get commission(): number
    {
        return this._commission;
    }

    // AS3: .../src/unknowns/_SafePkg_1932/_SafeCls_1990.as::get tokenBatchPrice()
    get tokenBatchPrice(): number
    {
        return this._tokenBatchPrice;
    }

    // AS3: .../src/unknowns/_SafePkg_1932/_SafeCls_1990.as::get tokenBatchSize()
    get tokenBatchSize(): number
    {
        return this._tokenBatchSize;
    }

    // A second getter over the same backing field as `tokenBatchSize` — AS3 declares both and both
    // return `_SafeStr_8383`. Kept because callers exist for either spelling.
    // AS3: .../src/unknowns/_SafePkg_1932/_SafeCls_1990.as::get tokensBatchSize()
    get tokensBatchSize(): number
    {
        return this._tokenBatchSize;
    }

    // AS3: .../src/unknowns/_SafePkg_1932/_SafeCls_1990.as::get offerMinPrice()
    get offerMinPrice(): number
    {
        return this._offerMinPrice;
    }

    // AS3: .../src/unknowns/_SafePkg_1932/_SafeCls_1990.as::get offerMaxPrice()
    get offerMaxPrice(): number
    {
        return this._offerMaxPrice;
    }

    // AS3: .../src/unknowns/_SafePkg_1932/_SafeCls_1990.as::get expirationHours()
    get expirationHours(): number
    {
        return this._expirationHours;
    }

    // AS3: .../src/unknowns/_SafePkg_1932/_SafeCls_1990.as::get averagePricePeriod()
    get averagePricePeriod(): number
    {
        return this._averagePricePeriod;
    }

    // AS3: .../src/unknowns/_SafePkg_1932/_SafeCls_1990.as::get sellingFeePercentage()
    get sellingFeePercentage(): number
    {
        return this._sellingFeePercentage;
    }

    // AS3: .../src/unknowns/_SafePkg_1932/_SafeCls_1990.as::get revenueLimit()
    get revenueLimit(): number
    {
        return this._revenueLimit;
    }

    // AS3: .../src/unknowns/_SafePkg_1932/_SafeCls_1990.as::get halfTaxLimit()
    get halfTaxLimit(): number
    {
        return this._halfTaxLimit;
    }

    // AS3: .../src/unknowns/_SafePkg_1932/_SafeCls_1990.as::flush()
    flush(): boolean
    {
        return true;
    }

    // AS3: .../src/unknowns/_SafePkg_1932/_SafeCls_1990.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._isEnabled = wrapper.readBoolean();
        this._commission = wrapper.readInt();
        this._tokenBatchPrice = wrapper.readInt();
        this._tokenBatchSize = wrapper.readInt();
        this._offerMinPrice = wrapper.readInt();
        this._offerMaxPrice = wrapper.readInt();
        this._expirationHours = wrapper.readInt();
        this._averagePricePeriod = wrapper.readInt();
        this._sellingFeePercentage = wrapper.readInt();
        this._revenueLimit = wrapper.readInt();
        this._halfTaxLimit = wrapper.readInt();

        return true;
    }
}

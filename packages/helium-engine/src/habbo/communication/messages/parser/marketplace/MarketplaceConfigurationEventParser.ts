import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * @see sources/win63_2026_crypted_version/src/unknowns/_SafePkg_1932/_SafeCls_1990.as
 * (real class name recovered from sources/win63_version/habbo/communication/messages/parser/marketplace/MarketplaceConfigurationEventParser.as)
 */
export class MarketplaceConfigurationEventParser implements IMessageParser
{
    private _isEnabled: boolean = false;

    private _commission: number = 0;

    private _tokenBatchPrice: number = 0;

    private _tokenBatchSize: number = 0;

    private _offerMinPrice: number = 0;

    private _offerMaxPrice: number = 0;

    private _expirationHours: number = 0;

    private _averagePricePeriod: number = 0;

    private _sellingFeePercentage: number = 0;

    private _revenueLimit: number = 0;

    private _halfTaxLimit: number = 0;

    get isEnabled(): boolean
    {
        return this._isEnabled;
    }

    get commission(): number
    {
        return this._commission;
    }

    get tokenBatchPrice(): number
    {
        return this._tokenBatchPrice;
    }

    get tokenBatchSize(): number
    {
        return this._tokenBatchSize;
    }

    get offerMinPrice(): number
    {
        return this._offerMinPrice;
    }

    get offerMaxPrice(): number
    {
        return this._offerMaxPrice;
    }

    get expirationHours(): number
    {
        return this._expirationHours;
    }

    get averagePricePeriod(): number
    {
        return this._averagePricePeriod;
    }

    get sellingFeePercentage(): number
    {
        return this._sellingFeePercentage;
    }

    get revenueLimit(): number
    {
        return this._revenueLimit;
    }

    get halfTaxLimit(): number
    {
        return this._halfTaxLimit;
    }

    flush(): boolean
    {
        return true;
    }

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

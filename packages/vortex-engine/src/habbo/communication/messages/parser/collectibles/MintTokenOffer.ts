import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * A bundle of mint tokens on sale for silver.
 *
 * Name DERIVED: obfuscated in every tree, named for the accessor that returns a list of these
 * (`CollectibleMintTokenOffersMessageParser.tokenOffers`).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/parser/collectibles/_SafeCls_2904.as
 */
export class MintTokenOffer
{
    // AS3: _SafeCls_2904.as::_offerId
    private _offerId: number = 0;
    // AS3: _SafeCls_2904.as::_productCode
    private _productCode: string = '';
    // AS3: _SafeCls_2904.as::_SafeStr_10061 (from `get silverPrice()`)
    private _silverPrice: number = 0;
    // AS3: _SafeCls_2904.as::_SafeStr_9732 (from `get amountTokens()`)
    private _amountTokens: number = 0;

    // AS3: _SafeCls_2904.as::_SafeCls_2904()
    constructor(wrapper: IMessageDataWrapper)
    {
        this._offerId = wrapper.readInt();
        this._productCode = wrapper.readString();
        this._silverPrice = wrapper.readInt();
        this._amountTokens = wrapper.readInt();
    }

    // AS3: _SafeCls_2904.as::get offerId()
    get offerId(): number
    {
        return this._offerId;
    }

    // AS3: _SafeCls_2904.as::get productCode()
    get productCode(): string
    {
        return this._productCode;
    }

    // AS3: _SafeCls_2904.as::get silverPrice()
    get silverPrice(): number
    {
        return this._silverPrice;
    }

    // AS3: _SafeCls_2904.as::get amountTokens()
    get amountTokens(): number
    {
        return this._amountTokens;
    }
}

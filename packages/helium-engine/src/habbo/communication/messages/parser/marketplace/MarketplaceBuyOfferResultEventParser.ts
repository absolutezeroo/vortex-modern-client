import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * @see sources/win63_2026_crypted_version/src/unknowns/_SafePkg_1932/_SafeCls_3972.as
 * (real class name recovered from sources/win63_version/habbo/communication/messages/parser/marketplace/MarketplaceBuyOfferResultEventParser.as)
 */
export class MarketplaceBuyOfferResultEventParser implements IMessageParser
{
    private _result: number = 0;

    private _offerId: number = -1;

    private _newPrice: number = -1;

    private _requestedOfferId: number = -1;

    get result(): number
    {
        return this._result;
    }

    get offerId(): number
    {
        return this._offerId;
    }

    get newPrice(): number
    {
        return this._newPrice;
    }

    get requestedOfferId(): number
    {
        return this._requestedOfferId;
    }

    flush(): boolean
    {
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._result = wrapper.readInt();
        this._offerId = wrapper.readInt();
        this._newPrice = wrapper.readInt();
        this._requestedOfferId = wrapper.readInt();

        return true;
    }
}

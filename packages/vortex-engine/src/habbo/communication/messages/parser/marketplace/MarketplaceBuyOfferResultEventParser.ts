import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * @see sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1932/_SafeCls_3972.as
 * (real class name recovered from sources/win63_version/habbo/communication/messages/parser/marketplace/MarketplaceBuyOfferResultEventParser.as)
 */
export class MarketplaceBuyOfferResultEventParser implements IMessageParser
{
    private _result: number = 0;

    private _offerId: number = -1;

    private _newPrice: number = -1;

    private _requestedOfferId: number = -1;

    // AS3: .../src/unknowns/_SafePkg_1932/_SafeCls_3972.as::get result()
    get result(): number
    {
        return this._result;
    }

    // AS3: .../src/unknowns/_SafePkg_1932/_SafeCls_3972.as::get offerId()
    get offerId(): number
    {
        return this._offerId;
    }

    // AS3: .../src/unknowns/_SafePkg_1932/_SafeCls_3972.as::get newPrice()
    get newPrice(): number
    {
        return this._newPrice;
    }

    // AS3: .../src/unknowns/_SafePkg_1932/_SafeCls_3972.as::get requestedOfferId()
    get requestedOfferId(): number
    {
        return this._requestedOfferId;
    }

    // AS3: .../src/unknowns/_SafePkg_1932/_SafeCls_3972.as::flush()
    flush(): boolean
    {
        return true;
    }

    // AS3: .../src/unknowns/_SafePkg_1932/_SafeCls_3972.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._result = wrapper.readInt();
        this._offerId = wrapper.readInt();
        this._newPrice = wrapper.readInt();
        this._requestedOfferId = wrapper.readInt();

        return true;
    }
}

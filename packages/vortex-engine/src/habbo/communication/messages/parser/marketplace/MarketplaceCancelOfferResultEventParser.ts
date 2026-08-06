import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * @see sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1932/_SafeCls_2414.as
 * (real class name recovered from sources/win63_version/habbo/communication/messages/parser/marketplace/MarketplaceCancelOfferResultEventParser.as)
 */
export class MarketplaceCancelOfferResultEventParser implements IMessageParser
{
    // AS3: .../src/unknowns/_SafePkg_1932/_SafeCls_2414.as::_offerId
    private _offerId: number = 0;

    private _success: boolean = false;

    // AS3: .../src/unknowns/_SafePkg_1932/_SafeCls_2414.as::get offerId()
    get offerId(): number
    {
        return this._offerId;
    }

    // AS3: .../src/unknowns/_SafePkg_1932/_SafeCls_2414.as::get success()
    get success(): boolean
    {
        return this._success;
    }

    // AS3: .../src/unknowns/_SafePkg_1932/_SafeCls_2414.as::flush()
    flush(): boolean
    {
        return true;
    }

    // AS3: .../src/unknowns/_SafePkg_1932/_SafeCls_2414.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._offerId = wrapper.readInt();
        this._success = wrapper.readBoolean();

        return true;
    }
}

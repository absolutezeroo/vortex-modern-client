import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * @see sources/win63_2026_crypted_version/src/unknowns/_SafePkg_1932/_SafeCls_2414.as
 * (real class name recovered from sources/win63_version/habbo/communication/messages/parser/marketplace/MarketplaceCancelOfferResultEventParser.as)
 */
export class MarketplaceCancelOfferResultEventParser implements IMessageParser
{
    private _offerId: number = 0;

    private _success: boolean = false;

    get offerId(): number
    {
        return this._offerId;
    }

    get success(): boolean
    {
        return this._success;
    }

    flush(): boolean
    {
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._offerId = wrapper.readInt();
        this._success = wrapper.readBoolean();

        return true;
    }
}

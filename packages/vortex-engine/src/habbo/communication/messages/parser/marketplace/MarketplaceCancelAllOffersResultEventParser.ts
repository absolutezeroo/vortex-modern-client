import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * TS-derived name: newer feature absent from win63_version/PRODUCTION-201601012205-226667486
 * entirely (no readable-name counterpart in any secondary/tertiary tree).
 *
 * @see sources/win63_2026_crypted_version/src/unknowns/_SafePkg_1932/_SafeCls_3349.as
 */
export class MarketplaceCancelAllOffersResultEventParser implements IMessageParser 
{
    private _offerIds: number[] = [];

    get offerIds(): number[] 
    {
        return this._offerIds;
    }

    private _success: boolean = false;

    get success(): boolean 
    {
        return this._success;
    }

    flush(): boolean 
    {
        this._offerIds = [];
        this._success = false;

        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean 
    {
        this._offerIds = [];

        const count = wrapper.readInt();

        for(let i = 0; i < count; i++) 
        {
            this._offerIds.push(wrapper.readInt());
        }

        this._success = wrapper.readBoolean();

        return true;
    }
}

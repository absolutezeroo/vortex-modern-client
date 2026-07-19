import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * TS-derived name: newer feature absent from win63_version/PRODUCTION-201601012205-226667486
 * entirely (no readable-name counterpart in any secondary/tertiary tree).
 *
 * @see sources/win63_2026_crypted_version/src/unknowns/_SafePkg_1932/_SafeCls_3433.as
 */
export class MarketplaceClearOwnHistoryResultEventParser implements IMessageParser 
{
    private _success: boolean = false;

    get success(): boolean 
    {
        return this._success;
    }

    flush(): boolean 
    {
        this._success = false;

        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean 
    {
        this._success = wrapper.readBoolean();

        return true;
    }
}

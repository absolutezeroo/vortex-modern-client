import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * TS-derived name: newer feature absent from win63_version/PRODUCTION-201601012205-226667486
 * entirely (no readable-name counterpart in any secondary/tertiary tree).
 *
 * @see sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1932/_SafeCls_3433.as
 */
export class MarketplaceClearOwnHistoryResultEventParser implements IMessageParser 
{
    private _success: boolean = false;

    // AS3: .../src/unknowns/_SafePkg_1932/_SafeCls_3433.as::get success()
    get success(): boolean 
    {
        return this._success;
    }

    // AS3: .../src/unknowns/_SafePkg_1932/_SafeCls_3433.as::flush()
    flush(): boolean 
    {
        this._success = false;

        return true;
    }

    // AS3: .../src/unknowns/_SafePkg_1932/_SafeCls_3433.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean 
    {
        this._success = wrapper.readBoolean();

        return true;
    }
}

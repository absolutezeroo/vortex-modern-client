import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * Whether a set/create/delete of a permanent variable was accepted, header 1643. One boolean.
 *
 * The failure path is the only one that shows: `VariableManagementDetailController` raises the
 * `modification_failed` notification on `false` and does nothing at all on `true` — the refreshed
 * list arrives separately, on 1557.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_4074/_SafeCls_4203.as
 * (name recovered from `sources/win63_version/.../variablesmanagement/
 * WiredSetUserPermanentVariableResultEventParser.as`)
 */
export class WiredSetUserPermanentVariableResultEventParser implements IMessageParser
{
    // AS3: _SafeCls_4203.as::success (backing field)
    private _success: boolean = false;

    // AS3: _SafeCls_4203.as::get success()
    get success(): boolean
    {
        return this._success;
    }

    // AS3: _SafeCls_4203.as::flush()
    flush(): boolean
    {
        this._success = false;

        return true;
    }

    // AS3: _SafeCls_4203.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._success = wrapper.readBoolean();

        return true;
    }
}

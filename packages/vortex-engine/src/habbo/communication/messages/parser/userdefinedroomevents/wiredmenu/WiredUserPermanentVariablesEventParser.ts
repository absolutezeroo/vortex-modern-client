import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import {
    WiredUserPermanentVariablesList
} from '@habbo/communication/messages/incoming/userdefinedroomevents/wiredmenu/WiredUserPermanentVariablesList';

/**
 * The permanent-variable list for one holder, header 1557.
 *
 * The whole read lives in {@link WiredUserPermanentVariablesList}'s constructor, exactly as in AS3 —
 * this parser only hands the buffer over and keeps the result.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_4074/_SafeCls_4091.as
 * (name recovered from `sources/win63_version/.../variablesmanagement/
 * WiredUserPermanentVariablesEventParser.as`)
 */
export class WiredUserPermanentVariablesEventParser implements IMessageParser
{
    // AS3: _SafeCls_4091.as::list (backing field)
    private _list: WiredUserPermanentVariablesList | null = null;

    // AS3: _SafeCls_4091.as::get list()
    get list(): WiredUserPermanentVariablesList | null
    {
        return this._list;
    }

    // AS3: _SafeCls_4091.as::flush()
    flush(): boolean
    {
        this._list = null;

        return true;
    }

    // AS3: _SafeCls_4091.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        // AS3 does not null-check the wrapper here, unlike most parsers in this package; the guard
        // is this port's and changes nothing on a well-formed frame.
        if(!wrapper) return false;

        this._list = new WiredUserPermanentVariablesList(wrapper);

        return true;
    }
}

import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * AllVariablesHashMessageParser — the server's hash of the room's full wired-variable set. The client
 * compares it to its cached hash to decide whether to request a diff.
 *
 * Name derived: fully obfuscated in AS3 (class `_SafeCls_4377`); named for its role.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/parser/userdefinedroomevents/wiredmenu/_SafeCls_4377.as
 */
export class AllVariablesHashMessageParser implements IMessageParser
{
    // AS3: _SafeCls_4377.as::_SafeStr_7856 (name derived from getter allVariablesHash)
    private _allVariablesHash: number = 0;

    // AS3: _SafeCls_4377.as::get allVariablesHash()
    get allVariablesHash(): number
    {
        return this._allVariablesHash;
    }

    // AS3: _SafeCls_4377.as::flush()
    flush(): boolean
    {
        this._allVariablesHash = 0;
        return true;
    }

    // AS3: _SafeCls_4377.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._allVariablesHash = wrapper.readInt();
        return true;
    }
}

import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import {VariableInfoAndHolders} from '@habbo/communication/messages/incoming/userdefinedroomevents/wiredcontext/VariableInfoAndHolders';

/**
 * VariableInfoAndHoldersParser — parses the overview tab's "variable holders" push (WIN63 header
 * 3506): a leading integer (discarded, the requested variable's echo) followed by a
 * {@link VariableInfoAndHolders} block (the variable descriptor + the object/value pairs holding it).
 *
 * Name derived: fully obfuscated in AS3 (class `_SafeCls_4177`); named for its role.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/parser/userdefinedroomevents/wiredmenu/_SafeCls_4177.as
 */
export class VariableInfoAndHoldersParser implements IMessageParser
{
    // AS3: _SafeCls_4177.as::_SafeStr_7883 (name derived: variable info + holders)
    private _variableInfoAndHolders: VariableInfoAndHolders | null = null;

    // AS3: _SafeCls_4177.as::flush()
    flush(): boolean
    {
        this._variableInfoAndHolders = null;
        return true;
    }

    // AS3: _SafeCls_4177.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        // AS3 reads and discards a leading integer before the block.
        wrapper.readInt();
        this._variableInfoAndHolders = new VariableInfoAndHolders(wrapper);
        return true;
    }

    // AS3: _SafeCls_4177.as::get variableInfoAndHolders()
    get variableInfoAndHolders(): VariableInfoAndHolders
    {
        return this._variableInfoAndHolders!;
    }
}

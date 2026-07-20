import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {AbstractVariableList} from '@habbo/communication/messages/incoming/userdefinedroomevents/wiredcontext/AbstractVariableList';
import {WiredVariable} from '@habbo/communication/messages/incoming/userdefinedroomevents/variables/WiredVariable';

/**
 * VariableList — a concrete AbstractVariableList holding a plain list of WiredVariable. The
 * constructor takes an already-parsed array; the static createFromMessage() reads the list off
 * the message stream (a length-prefixed run of WiredVariable) and wraps it. Overrides the base
 * variables getter to return the backing list instead of the empty default.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2576/VariableList.as
 */
export class VariableList extends AbstractVariableList
{
    // AS3: VariableList.as::variables (backing field, obfuscated _SafeStr_6990)
    private _variables: WiredVariable[];

    // AS3: VariableList.as::VariableList()
    constructor(variables: WiredVariable[])
    {
        super();
        this._variables = variables;
    }

    // AS3: VariableList.as::createFromMessage()
    static createFromMessage(wrapper: IMessageDataWrapper): VariableList
    {
        const variables: WiredVariable[] = [];
        const count: number = wrapper.readInt();
        for(let i = 0; i < count; i++)
        {
            variables.push(new WiredVariable(wrapper));
        }
        return new VariableList(variables);
    }

    // AS3: VariableList.as::get variables()
    override get variables(): WiredVariable[]
    {
        return this._variables;
    }
}

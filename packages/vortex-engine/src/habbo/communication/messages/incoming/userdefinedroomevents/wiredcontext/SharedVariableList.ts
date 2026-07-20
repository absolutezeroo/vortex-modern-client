import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {AbstractVariableList} from '@habbo/communication/messages/incoming/userdefinedroomevents/wiredcontext/AbstractVariableList';
import {SharedVariable} from '@habbo/communication/messages/incoming/userdefinedroomevents/variables/SharedVariable';
import type {WiredVariable} from '@habbo/communication/messages/incoming/userdefinedroomevents/variables/WiredVariable';

/**
 * SharedVariableList — a wired-context variable list holding the shared variables imported from
 * other rooms. Constructed inline from the message stream: reads a count, then that many
 * SharedVariable entries, keeping both the full SharedVariable objects (sharedVariables) and their
 * underlying WiredVariable (variables, overriding the AbstractVariableList base).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2576/SharedVariableList.as
 */
export class SharedVariableList extends AbstractVariableList
{
    // AS3: SharedVariableList.as::sharedVariables (backing field _SafeStr_8732)
    private _sharedVariables: SharedVariable[];

    // AS3: SharedVariableList.as::variables (backing field _SafeStr_6990)
    private _variables: WiredVariable[];

    // AS3: SharedVariableList.as::SharedVariableList()
    constructor(wrapper: IMessageDataWrapper)
    {
        super();
        this._sharedVariables = [];
        this._variables = [];
        const count: number = wrapper.readInt();
        for(let i = 0; i < count; i++)
        {
            const shared: SharedVariable = new SharedVariable(wrapper);
            this._sharedVariables.push(shared);
            this._variables.push(shared.wiredVariable);
        }
    }

    // AS3: SharedVariableList.as::get variables()
    override get variables(): WiredVariable[]
    {
        return this._variables;
    }

    // AS3: SharedVariableList.as::get sharedVariables()
    get sharedVariables(): SharedVariable[]
    {
        return this._sharedVariables;
    }
}

import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {AbstractVariableList} from '@habbo/communication/messages/incoming/userdefinedroomevents/wiredcontext/AbstractVariableList';
import type {WiredVariable} from '@habbo/communication/messages/incoming/userdefinedroomevents/variables/WiredVariable';

/**
 * AllVariablesInRoom — a wired-context variable list holding every WiredVariable in the room,
 * keyed by a server-supplied content hash. Constructed inline from the message stream (it reads
 * only its hash); the actual variable list starts null and is filled in later via synchronize().
 * needsSynchronize() reports whether the client must still request the variables for this hash.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2576/AllVariablesInRoom.as
 */
export class AllVariablesInRoom extends AbstractVariableList
{
    // AS3: AllVariablesInRoom.as::hash (backing field _SafeStr_7856)
    private _hash: number;

    // AS3: AllVariablesInRoom.as::variables (backing field _SafeStr_6990)
    private _variables: WiredVariable[] | null = null;

    // AS3: AllVariablesInRoom.as::AllVariablesInRoom()
    constructor(wrapper: IMessageDataWrapper)
    {
        super();
        this._hash = wrapper.readInt();
    }

    // AS3: AllVariablesInRoom.as::get variables()
    override get variables(): WiredVariable[] | null
    {
        return this._variables;
    }

    // AS3: AllVariablesInRoom.as::get needsSynchronize()
    get needsSynchronize(): boolean
    {
        return this._variables === null;
    }

    // AS3: AllVariablesInRoom.as::get hash()
    get hash(): number
    {
        return this._hash;
    }

    // AS3: AllVariablesInRoom.as::synchronize()
    synchronize(variables: WiredVariable[]): void
    {
        this._variables = [];
        for(const variable of variables)
        {
            this._variables.push(variable);
        }
    }
}

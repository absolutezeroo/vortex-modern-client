import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {WiredVariable} from '@habbo/communication/messages/incoming/userdefinedroomevents/variables/WiredVariable';
import {ObjectIdAndValuePair} from '@habbo/communication/messages/incoming/userdefinedroomevents/variables/ObjectIdAndValuePair';

/**
 * VariableInfoAndHolders — a wired variable together with the object/value pairs that hold
 * it across the room. Constructed inline from the message stream: the variable first, then a
 * length-prefixed list of ObjectIdAndValuePair holders.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2576/VariableInfoAndHolders.as
 */
export class VariableInfoAndHolders
{
    // AS3: VariableInfoAndHolders.as::variable
    private _variable: WiredVariable;

    // AS3: VariableInfoAndHolders.as::holders
    private _holders: ObjectIdAndValuePair[];

    // AS3: VariableInfoAndHolders.as::VariableInfoAndHolders()
    constructor(wrapper: IMessageDataWrapper)
    {
        this._variable = new WiredVariable(wrapper);
        this._holders = [];
        const count: number = wrapper.readInt();
        for(let i = 0; i < count; i++)
        {
            this._holders.push(new ObjectIdAndValuePair(wrapper));
        }
    }

    // AS3: VariableInfoAndHolders.as::get variable()
    get variable(): WiredVariable
    {
        return this._variable;
    }

    // AS3: VariableInfoAndHolders.as::get holders()
    get holders(): ObjectIdAndValuePair[]
    {
        return this._holders;
    }
}

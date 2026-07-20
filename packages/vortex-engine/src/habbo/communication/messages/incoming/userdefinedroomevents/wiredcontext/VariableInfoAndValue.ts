import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {WiredVariable} from '@habbo/communication/messages/incoming/userdefinedroomevents/variables/WiredVariable';

/**
 * VariableInfoAndValue — pairs a wired variable's full definition with its current integer
 * value, as carried in a wired-context payload. Constructed inline from the message stream.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2576/VariableInfoAndValue.as
 */
export class VariableInfoAndValue
{
    // AS3: VariableInfoAndValue.as::variable
    private _variable: WiredVariable;

    // AS3: VariableInfoAndValue.as::value
    private _value: number;

    // AS3: VariableInfoAndValue.as::VariableInfoAndValue()
    constructor(wrapper: IMessageDataWrapper)
    {
        this._variable = new WiredVariable(wrapper);
        this._value = wrapper.readInt();
    }

    // AS3: VariableInfoAndValue.as::get variable()
    get variable(): WiredVariable
    {
        return this._variable;
    }

    // AS3: VariableInfoAndValue.as::get value()
    get value(): number
    {
        return this._value;
    }
}

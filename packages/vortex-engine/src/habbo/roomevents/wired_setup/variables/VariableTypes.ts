import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';
import {VariableDefinition} from '@habbo/communication/messages/incoming/userdefinedroomevents/VariableDefinition';

import type {IWiredElement} from '../IWiredElement';
import type {IWiredTypeHolder} from '../IWiredTypeHolder';

/**
 * VariableTypes — the wired variable registry (IWiredTypeHolder).
 *
 * PORT GAP: no variable types are ported yet (the whole variables/ category is pending — TODO(AS3)),
 * so `_types` is empty and getElementByCode returns null for every code. The registry still exists so
 * the controller can resolve the variable holder and no variable dialog opens until the types land.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/variables/VariableTypes.as
 */
export class VariableTypes implements IWiredTypeHolder
{
    // AS3: VariableTypes.as::_types (empty until the variables category is ported)
    private _types: IWiredElement[] = [];

    // AS3: VariableTypes.as::getByCode()
    getByCode(code: number): IWiredElement | null
    {
        for(const type of this._types)
        {
            if(type.code === code)
            {
                return type;
            }
        }

        return null;
    }

    // AS3: VariableTypes.as::getElementByCode()
    getElementByCode(code: number): IWiredElement
    {
        return this.getByCode(code) as IWiredElement;
    }

    // AS3: VariableTypes.as::getKey()
    getKey(): string
    {
        return 'variable';
    }

    // AS3: VariableTypes.as::acceptTriggerable()
    acceptTriggerable(triggerable: Triggerable): boolean
    {
        return triggerable instanceof VariableDefinition;
    }
}

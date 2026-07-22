import {WiredVariableDataType} from '@habbo/communication/messages/incoming/userdefinedroomevents/variables/WiredVariableDataType';

import {DefaultElement} from '../DefaultElement';
import type {VariableNameSection} from '../uibuilder/presets/sections/VariableNameSection';
import type {IVariableType} from './IVariableType';

/**
 * DefaultVariableType — the base for concrete wired variable types. Owns the initial variable name
 * (mirrored into the variable-name section), a default holder type of 0, and the `isVariableStored`
 * helper (a variable is "stored" when its availability is 10 or 11).
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4097` (implements _SafeCls_3688 = IVariableType).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/variables/_SafeCls_4097.as
 */
export class DefaultVariableType extends DefaultElement implements IVariableType
{
    // AS3: _SafeCls_4097.as::_initialVariableName
    private _initialVariableName: string = '';

    // AS3: _SafeCls_4097.as::isVariableStored()
    protected static isVariableStored(type: number): boolean
    {
        return type === WiredVariableDataType.AVAILABILITY_11 || type === WiredVariableDataType.AVAILABILITY_10;
    }

    // AS3: _SafeCls_4097.as::set initialVariableName()
    set initialVariableName(value: string)
    {
        this._initialVariableName = value;

        const section = this.variableNameSection;

        if(section != null)
        {
            section.variableName = value;
        }
    }

    // AS3: _SafeCls_4097.as::get initialVariableName()
    get initialVariableName(): string
    {
        return this._initialVariableName;
    }

    // AS3: _SafeCls_4097.as::variableType()
    variableType(): number
    {
        return 0;
    }

    // AS3: _SafeCls_4097.as::get variableNameSection()
    protected get variableNameSection(): VariableNameSection | null
    {
        return null;
    }
}

import {WiredInputSourcePicker} from '../inputsources/WiredInputSourcePicker';
import {SelectorCodes} from './SelectorCodes';
import {VariableSelector} from './VariableSelector';

/**
 * FurniWithVariable — the furni variant of VariableSelector (picker scoped to the furni source).
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4353` and its code is the value-named
 * SelectorCodes.FURNI_WITH_VARIABLE; the name follows that code.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/selectors/_SafeCls_4353.as
 */
export class FurniWithVariable extends VariableSelector
{
    // AS3: _SafeCls_4353.as::get code()
    override get code(): number
    {
        return SelectorCodes.FURNI_WITH_VARIABLE;
    }

    // AS3: _SafeCls_4353.as::get variableSource()
    protected override get variableSource(): number
    {
        return WiredInputSourcePicker.FURNI_SOURCE;
    }
}

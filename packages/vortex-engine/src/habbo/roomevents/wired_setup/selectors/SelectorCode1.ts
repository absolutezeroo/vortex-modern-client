import {SelectorCodes} from './SelectorCodes';
import {DefaultSelectorType} from './DefaultSelectorType';

/**
 * SelectorCode1 — a parameterless furni wired selector that forces furni selection. Its identity is not
 * recoverable from any source tree.
 *
 * Name derived: both the AS3 class (`_SafeCls_4318`) and the code it returns are obfuscated with no
 * readable counterpart in any tree (the code is value 1, postdating the 2016 build). The class name
 * mirrors that derivation rather than inventing a semantic label.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/selectors/_SafeCls_4318.as
 */
export class SelectorCode1 extends DefaultSelectorType
{
    // AS3: _SafeCls_4318.as::get code()
    override get code(): number
    {
        return SelectorCodes.SELECTOR_CODE_1;
    }

    // AS3: _SafeCls_4318.as::get forceFurniSelection()
    override get forceFurniSelection(): boolean
    {
        return true;
    }
}

import {SelectorCodes} from './SelectorCodes';
import {DefaultSelectorType} from './DefaultSelectorType';

/**
 * FurniFromSignal — the "furnis forwarded from a signal" wired selector. Takes no form inputs.
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4075`; the name follows the code it returns
 * (SelectorCodes.FURNI_FROM_SIGNAL).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/selectors/_SafeCls_4075.as
 */
export class FurniFromSignal extends DefaultSelectorType
{
    // AS3: _SafeCls_4075.as::get code()
    override get code(): number
    {
        return SelectorCodes.FURNI_FROM_SIGNAL;
    }
}

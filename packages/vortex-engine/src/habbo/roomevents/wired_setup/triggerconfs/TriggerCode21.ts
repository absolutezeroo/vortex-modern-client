import {TriggerConfCodes} from './TriggerConfCodes';
import {DefaultTriggerConf} from './DefaultTriggerConf';

/**
 * TriggerCode21 — a parameterless wired trigger with no recoverable identity. Takes no form inputs.
 *
 * Name derived: both the AS3 class (`_SafeCls_4341`) and the code it returns are obfuscated with no
 * readable counterpart in any source tree (the code is value 21, postdating the 2016 build). The class
 * name mirrors that derivation rather than inventing a semantic label.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/triggerconfs/_SafeCls_4341.as
 */
export class TriggerCode21 extends DefaultTriggerConf
{
    // AS3: _SafeCls_4341.as::get code()
    override get code(): number
    {
        return TriggerConfCodes.TRIGGER_CODE_21;
    }
}

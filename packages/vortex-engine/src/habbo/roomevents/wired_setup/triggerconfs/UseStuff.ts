import {TriggerConfCodes} from './TriggerConfCodes';
import {DefaultTriggerConf} from './DefaultTriggerConf';

/**
 * UseStuff — the "an avatar uses (toggles) the furni" wired trigger. Takes no form inputs.
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4319`; the name follows the code it returns
 * (TriggerConfCodes.USE_STUFF). The 2016 PRODUCTION build named the code-4 trigger ToggleFurni.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/triggerconfs/_SafeCls_4319.as
 */
export class UseStuff extends DefaultTriggerConf
{
    // AS3: _SafeCls_4319.as::get code()
    override get code(): number
    {
        return TriggerConfCodes.USE_STUFF;
    }
}

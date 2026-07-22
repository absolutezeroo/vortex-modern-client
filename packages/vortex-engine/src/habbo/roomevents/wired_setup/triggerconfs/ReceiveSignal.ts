import {TriggerConfCodes} from './TriggerConfCodes';
import {DefaultTriggerConf} from './DefaultTriggerConf';

/**
 * ReceiveSignal — the "a signal is received" wired trigger. Takes no form inputs.
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4199`; the name follows the code it returns
 * (TriggerConfCodes.RECEIVE_SIGNAL).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/triggerconfs/_SafeCls_4199.as
 */
export class ReceiveSignal extends DefaultTriggerConf
{
    // AS3: _SafeCls_4199.as::get code()
    override get code(): number
    {
        return TriggerConfCodes.RECEIVE_SIGNAL;
    }
}

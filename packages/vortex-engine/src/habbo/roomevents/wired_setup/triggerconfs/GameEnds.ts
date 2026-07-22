import {TriggerConfCodes} from './TriggerConfCodes';
import {DefaultTriggerConf} from './DefaultTriggerConf';

/**
 * GameEnds — the "a game ends" wired trigger. Takes no form inputs.
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4168`; the name follows the code it returns
 * (TriggerConfCodes.GAME_ENDS).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/triggerconfs/_SafeCls_4168.as
 */
export class GameEnds extends DefaultTriggerConf
{
    // AS3: _SafeCls_4168.as::get code()
    override get code(): number
    {
        return TriggerConfCodes.GAME_ENDS;
    }
}

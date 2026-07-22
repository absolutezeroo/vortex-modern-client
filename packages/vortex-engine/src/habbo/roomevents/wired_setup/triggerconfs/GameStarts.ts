import {TriggerConfCodes} from './TriggerConfCodes';
import {DefaultTriggerConf} from './DefaultTriggerConf';

/**
 * GameStarts — the "a game starts" wired trigger. Takes no form inputs.
 *
 * Name derived: the AS3 class is obfuscated as `_SafeCls_4303`; the name follows the code it returns
 * (TriggerConfCodes.GAME_STARTS).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/triggerconfs/_SafeCls_4303.as
 */
export class GameStarts extends DefaultTriggerConf
{
    // AS3: _SafeCls_4303.as::get code()
    override get code(): number
    {
        return TriggerConfCodes.GAME_STARTS;
    }
}

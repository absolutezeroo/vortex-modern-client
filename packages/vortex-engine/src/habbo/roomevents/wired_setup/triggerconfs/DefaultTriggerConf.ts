import {DefaultElement} from '../DefaultElement';
import type {ITriggerConf} from './ITriggerConf';

/**
 * DefaultTriggerConf — the base for concrete wired trigger-configuration types. It adds nothing over
 * DefaultElement; concrete triggers override `code` (and, where they take parameters, buildInputs/
 * onEditStart/read/validate).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/triggerconfs/DefaultTriggerConf.as
 */
export class DefaultTriggerConf extends DefaultElement implements ITriggerConf
{
}

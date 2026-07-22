import type {IWiredElement} from '../IWiredElement';

/**
 * ITriggerConf — marker interface for wired trigger-configuration element types. It adds nothing to
 * IWiredElement; it exists only so the trigger registry (TriggerConfs) can type its elements distinctly
 * from actions/conditions/etc.
 *
 * Name derived: the AS3 interface is obfuscated as `_SafeCls_4034` (declared `extends _SafeCls_2869`
 * = IWiredElement); named after DefaultTriggerConf, the class that implements it.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/triggerconfs/_SafeCls_4034.as
 */
export interface ITriggerConf extends IWiredElement
{
}

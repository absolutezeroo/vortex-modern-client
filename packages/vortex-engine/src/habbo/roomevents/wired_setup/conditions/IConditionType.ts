import type {IWiredElement} from '../IWiredElement';

/**
 * IConditionType — marker interface for wired condition element types. It adds nothing to
 * IWiredElement; it exists only so the condition registry (ConditionTypes) can type its elements
 * distinctly from actions/triggers/etc.
 *
 * Name derived: the AS3 interface is obfuscated as `_SafeCls_4012` (declared `extends _SafeCls_2869`
 * = IWiredElement); named after DefaultConditionType, the class that implements it.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/conditions/_SafeCls_4012.as
 */
export interface IConditionType extends IWiredElement
{
}

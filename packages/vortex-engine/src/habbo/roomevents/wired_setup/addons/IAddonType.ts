import type {IWiredElement} from '../IWiredElement';

/**
 * IAddonType — marker interface for wired addon element types. It adds nothing to IWiredElement; it
 * exists only so the addon registry (AddonTypes) can type its elements distinctly.
 *
 * Name derived: the AS3 interface is obfuscated as `_SafeCls_4010` (declared `extends _SafeCls_2869`
 * = IWiredElement); named after DefaultAddonType, the class that implements it.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/addons/_SafeCls_4010.as
 */
export interface IAddonType extends IWiredElement
{
}

import type {IWiredElement} from '../IWiredElement';

/**
 * IVariableType — interface for wired variable element types: an IWiredElement that also reports its
 * initial variable name and its holder type (furni/user/global/context).
 *
 * Name derived: the AS3 interface is obfuscated as `_SafeCls_3688` (extends _SafeCls_2869 =
 * IWiredElement); named after DefaultVariableType, the class that implements it.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/variables/_SafeCls_3688.as
 */
export interface IVariableType extends IWiredElement
{
    // AS3: _SafeCls_3688.as::get initialVariableName()
    readonly initialVariableName: string;

    // AS3: _SafeCls_3688.as::variableType()
    variableType(): number;
}

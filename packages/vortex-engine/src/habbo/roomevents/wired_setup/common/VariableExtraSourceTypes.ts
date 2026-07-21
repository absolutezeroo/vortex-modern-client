/**
 * VariableExtraSourceTypes — extra (negative) input-source type ids used by wired variables, beyond
 * the furni/user sources: a room-global source and a wired-context source.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/common/VariableExtraSourceTypes.as
 */
export class VariableExtraSourceTypes
{
    // AS3: VariableExtraSourceTypes.as::GLOBAL_SOURCE
    public static readonly GLOBAL_SOURCE: number = -10;

    // AS3: VariableExtraSourceTypes.as::CONTEXT_SOURCE
    public static readonly CONTEXT_SOURCE: number = -20;
}

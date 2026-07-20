/**
 * WiredVariableHolderType — the kind of entity that holds a wired variable's value:
 * a piece of furniture, a user, a room-global slot, or the trigger context. A wired
 * variable subclass reports one of these from its `variableType()`/`variableTarget`.
 *
 * Name derived: enum has no readable class name (WIN63 obfuscated _SafeCls_4496 / "_-51U";
 * no counterpart in vortex-flash-client). FURNI/USER keep their real AS3 names; GLOBAL and
 * CONTEXT are derived — the variable classes returning them expose code() ==
 * VariableCodes.GLOBAL_VARIABLE (-10) and VariableCodes.CONTEXT_VARIABLE (-20) respectively.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3851/_SafeCls_4496.as
 */
export class WiredVariableHolderType
{
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3851/_SafeCls_4496.as::FURNI
    static readonly FURNI: number = 0;

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3851/_SafeCls_4496.as::USER
    static readonly USER: number = 1;

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3851/_SafeCls_4496.as::GLOBAL
    // Name derived: original _SafeStr_10439 ("_-Sj", value -10) — returned by the variable class
    // whose code() is VariableCodes.GLOBAL_VARIABLE (_SafeCls_4098).
    static readonly GLOBAL: number = -10;

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3851/_SafeCls_4496.as::CONTEXT
    // Name derived: original _SafeStr_10437 ("_-61g", value -20) — returned by the variable class
    // whose code() is VariableCodes.CONTEXT_VARIABLE (_SafeCls_4417).
    static readonly CONTEXT: number = -20;
}

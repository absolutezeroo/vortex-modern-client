/**
 * WiredVariableType — the `variableType` classification carried by a WiredVariable
 * (see WiredVariable.variableType). Drives which tab a variable falls under in the wired
 * new-variable picker (TabButtonConfigs) and gates several editor behaviours (echo-variable
 * selection, VariableUpdate create/delete options, initial picker tab).
 *
 * Name derived: WIN63 obfuscated the class (_SafeCls_4123) and three of its four constants;
 * only INTERNAL kept a real name. No counterpart in vortex-flash-client. Constant names are
 * derived from usage (WIN63 obfuscated _SafeStr_9747/_SafeStr_10293/_SafeStr_9781; no
 * counterpart in vortex-flash-client):
 *   - STANDARD (0): the plain user-created furni variable — the only type excluded from the
 *     echo-variable selection filter (variableSelectionFilter: variableType != 0) and the
 *     create-and-delete FURNI variable (actiontypes/_SafeCls_4065).
 *   - INTERNAL (1): real AS3 name; groups under the "internal" picker tab (internalFilter).
 *   - GLOBAL (2): also user-created (grouped with STANDARD in the "user_created" tab), but
 *     treated as global/shared in VariableUpdate.onChangeVariable (grouped with a global
 *     availability type).
 *   - DYNAMIC (3): the "smart"/dynamic variable — the var_picker_smart / "dynamic" tab
 *     (dynamicFilter); also selects the dynamic tab as the picker's initial tab.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3851/_SafeCls_4123.as
 */
export class WiredVariableType
{
    // AS3: unknowns/_SafePkg_3851/_SafeCls_4123.as::STANDARD (value 0) — name derived from usage
    // (WIN63 obfuscated _SafeStr_9747; no counterpart in vortex-flash-client).
    static readonly STANDARD: number = 0;

    // AS3: unknowns/_SafePkg_3851/_SafeCls_4123.as::INTERNAL
    static readonly INTERNAL: number = 1;

    // AS3: unknowns/_SafePkg_3851/_SafeCls_4123.as::GLOBAL (value 2) — name derived from usage
    // (WIN63 obfuscated _SafeStr_10293; no counterpart in vortex-flash-client).
    static readonly GLOBAL: number = 2;

    // AS3: unknowns/_SafePkg_3851/_SafeCls_4123.as::DYNAMIC (value 3) — name derived from usage
    // (WIN63 obfuscated _SafeStr_9781; no counterpart in vortex-flash-client).
    static readonly DYNAMIC: number = 3;
}

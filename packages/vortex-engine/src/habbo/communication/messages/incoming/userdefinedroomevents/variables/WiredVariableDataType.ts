/**
 * WiredVariableDataType — the set of "availability type" codes a wired variable can carry.
 * These are the constants {@link WiredVariable}'s `availabilityType` field is compared against:
 * `isStored` is `availabilityType < 100` and `isPersisted` is `availabilityType` in {10, 11, 20}.
 *
 * The wire values are authoritative (they are matched by number, never by name); every constant
 * name below is DERIVED from its value and its observed use, not recovered.
 *
 * Name derived: the class and all member names are obfuscated (WIN63 `_SafeCls_4323`, members
 * `_SafeStr_*`; win63_version `class_3904`, members `var_*`) and there is no unobfuscated
 * counterpart in any source tree — the feature postdates the PRODUCTION-2016 build.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3851/_SafeCls_4323.as
 */
export class WiredVariableDataType
{
    // AS3: _SafeCls_4323.as::AVAILABILITY_0 (value 0) — name derived; stored, not persisted.
    static readonly AVAILABILITY_0: number = 0;

    // AS3: _SafeCls_4323.as::AVAILABILITY_1 (value 1) — name derived; stored, not persisted.
    static readonly AVAILABILITY_1: number = 1;

    // AS3: _SafeCls_4323.as::AVAILABILITY_10 (value 10) — name derived; stored and persisted.
    static readonly AVAILABILITY_10: number = 10;

    // AS3: _SafeCls_4323.as::AVAILABILITY_11 (value 11) — name derived; stored and persisted.
    static readonly AVAILABILITY_11: number = 11;

    // AS3: _SafeCls_4323.as::AVAILABILITY_20 (value 20) — name derived; stored and persisted.
    static readonly AVAILABILITY_20: number = 20;

    // AS3: _SafeCls_4323.as::AVAILABILITY_21 (value 21) — name derived; stored, not persisted.
    static readonly AVAILABILITY_21: number = 21;

    // AS3: _SafeCls_4323.as::DEFAULT (value 0) — name derived: a default/sentinel distinct from the
    // real availability codes; the WiredVariableDataTypeExtended variant (win63_version class_4078)
    // sets this same slot to 999.
    static readonly DEFAULT: number = 0;
}

/**
 * WiredVariableDataTypeExtended — the availability/storage classification carried by a
 * WiredVariable's `availabilityType` field (WiredVariable.availabilityType, the wire int
 * `_SafeStr_6508`). Consumers switch on these values: WiredVariable.isStored treats any value
 * below 100 as "stored", WiredVariable.isPersisted whitelists {10, 11, 20}, VariableUpdate gates a
 * checkbox on `availabilityType == TYPE_21`, and `_SafeCls_4097.isVariableStored` checks
 * {10, 11}. This "Extended" variant is byte-for-byte the base WiredVariableDataType (_SafeCls_4323)
 * except its sentinel constant is 999 instead of 0, which is the only reason both classes exist.
 *
 * Name derived: the class and every constant are obfuscated in WIN63 (class _SafeCls_4480, original
 * "_-11j"; constants _SafeStr_*), and no counterpart exists in vortex-flash-client (win63_version /
 * PRODUCTION — the wired-variable system postdates the 2016 build). No semantic label for the six
 * tier values is recoverable in any tree, so each constant name encodes its wire value (TYPE_<n>);
 * only the diverging sentinel gets a semantic name (UNKNOWN, value 999).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3851/_SafeCls_4480.as
 */
export class WiredVariableDataTypeExtended
{
    // AS3: _SafeCls_4480.as::TYPE_0 (value 0; obfuscated _SafeStr_10379) — name derived from wire
    // value; also the zero tier shared with base WiredVariableDataType.
    static readonly TYPE_0: number = 0;

    // AS3: _SafeCls_4480.as::TYPE_1 (value 1; obfuscated _SafeStr_10347) — name derived from wire value.
    static readonly TYPE_1: number = 1;

    // AS3: _SafeCls_4480.as::TYPE_10 (value 10; obfuscated _SafeStr_9550) — name derived from wire
    // value; in WiredVariable.isPersisted and _SafeCls_4097.isVariableStored.
    static readonly TYPE_10: number = 10;

    // AS3: _SafeCls_4480.as::TYPE_11 (value 11; obfuscated _SafeStr_9570) — name derived from wire
    // value; in WiredVariable.isPersisted and _SafeCls_4097.isVariableStored.
    static readonly TYPE_11: number = 11;

    // AS3: _SafeCls_4480.as::TYPE_20 (value 20; obfuscated _SafeStr_10177) — name derived from wire
    // value; in WiredVariable.isPersisted.
    static readonly TYPE_20: number = 20;

    // AS3: _SafeCls_4480.as::TYPE_21 (value 21; obfuscated _SafeStr_10263) — name derived from wire
    // value; gates the checkbox in VariableUpdate.onChangeVariable.
    static readonly TYPE_21: number = 21;

    // AS3: _SafeCls_4480.as::UNKNOWN (value 999; obfuscated _SafeStr_10375) — name derived: the only
    // constant that diverges from base WiredVariableDataType (0 there), and >= 100 so
    // WiredVariable.isStored classifies it as not stored; a classic unspecified sentinel.
    static readonly UNKNOWN: number = 999;
}

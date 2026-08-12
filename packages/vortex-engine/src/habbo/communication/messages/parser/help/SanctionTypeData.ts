/**
 * One sanction *kind* — a name plus its duration, used both for the sanction a player is serving
 * and for the one they would get next.
 *
 * The class is obfuscated in every tree, so the class name is DERIVED; `name` is recovered.
 * `durationHours` and `probationHours` are derived too, from the only code that reads them
 * (`SanctionInfo.getNextSanctionDescription()`, which divides the first by 24 to phrase a ban in
 * days and quotes it directly as hours for a mute).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2056/_SafeCls_3171.as
 */
export class SanctionTypeData
{
    // AS3: .../_SafeCls_3171.as::name
    public name: string = '';

    /**
     * How long this sanction lasts, in hours.
     *
     * Name DERIVED: `getNextSanctionDescription()` quotes it as hours for a MUTE and divides it by
     * 24 for a ban, which fixes both the unit and the meaning.
     */
    // AS3: .../_SafeCls_3171.as::_SafeStr_8342
    public durationHours: number = 0;

    /**
     * Name DERIVED and *uncertain*: nothing in the 2026 client reads this field, so its meaning
     * cannot be recovered from a call site the way `durationHours` can. Parsed so the stream stays
     * aligned; do not rely on the name.
     */
    // AS3: .../_SafeCls_3171.as::_SafeStr_10366
    public probationHours: number = 0;
}

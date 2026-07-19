/**
 * Formats a duration in seconds as "H:MM:SS" — the monsterplant well-being countdown text.
 *
 * The AS3 class name is unrecoverable: it is obfuscated in the primary (`_SafeCls_4062`) *and* the
 * secondary (`class_3965`), and the class does not exist in the tertiary tree at all, so there is
 * no tree left to cross-reference. `SecondsFormatter` is therefore this port's name (same situation
 * and same handling as PetBreedingResultData/class_3688). The member name below is not invented —
 * `formatSeconds()` is AS3's own public static.
 *
 * Distinct from FriendlyTime, which produces localized fuzzy durations ("2 hours"); this one is a
 * fixed clock format and AS3 keeps the two separate.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/_SafeCls_4062.as
 */
export class SecondsFormatter
{
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/infostand/_SafeCls_4062.as::formatSeconds()
    // AS3 coerces through uint, which floors and clamps negatives to a huge positive; Math.max(0)
    // here keeps the floor without reproducing that overflow for a negative countdown.
    public static formatSeconds(value: number): string
    {
        const total = Math.max(0, Math.floor(value));
        const hours = Math.floor(total / 3600);
        const minutes = Math.floor((total - hours * 3600) / 60);
        const seconds = total - hours * 3600 - minutes * 60;

        return `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
}

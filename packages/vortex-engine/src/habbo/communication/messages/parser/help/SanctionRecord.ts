import {SanctionTypeData} from './SanctionTypeData';

/**
 * One entry in the player's sanction history.
 *
 * `description` is what the window actually prints; the rest only appears when
 * `showsProbationDetails` is set, which is what turns a one-line row into the "you are on
 * probation, N days left, next time it will be X" block.
 *
 * The class is obfuscated in every tree and every field with it, so all five names are DERIVED —
 * each from the one place `SanctionInfo` reads it. `probationHoursLeft` is the strongest of them:
 * `getProbationDaysLeft()` is literally `ceil(field / 24)`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2056/_SafeCls_3835.as
 */
export class SanctionRecord
{
    // AS3: .../_SafeCls_3835.as::_SafeStr_10307 (the first readSanctionType of the pair)
    public sanctionType: SanctionTypeData = new SanctionTypeData();

    // AS3: .../_SafeCls_3835.as::_SafeStr_8395 (the row text `buildSanctionDescriptions()` prints)
    public description: string = '';

    // AS3: .../_SafeCls_3835.as::_SafeStr_10227 (gates `appendGradualSanctionDetails()`)
    public showsProbationDetails: boolean = false;

    // AS3: .../_SafeCls_3835.as::_SafeStr_8444 (`getProbationDaysLeft()` is ceil(this / 24))
    public probationHoursLeft: number = 0;

    // AS3: .../_SafeCls_3835.as::_SafeStr_8778 (the second readSanctionType — the *next* sanction)
    public nextSanctionType: SanctionTypeData = new SanctionTypeData();
}

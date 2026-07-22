/**
 * SelectorCodes — the server wired-selector type ids returned by each concrete selector's `code`
 * getter. Selectors pick the furni/users a wired action or condition operates on.
 *
 * AS3 declares these as mutable `public static var`; they are never reassigned, so the port makes them
 * `readonly`. Four are obfuscated with no readable counterpart in any tree (selectors postdate the 2016
 * build): SELECTOR_CODE_1 (1, a parameterless furni selector), FURNI_IN_NEIGHBORHOOD (6) and
 * FURNI_IN_AREA (7) — the furni analogues of USERS_IN_NEIGHBORHOOD (12) / USERS_IN_AREA (13) — and
 * FURNI_WITH_VARIABLE (17), the furni analogue of USERS_WITH_VARIABLE (18).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/selectors/SelectorCodes.as
 */
export class SelectorCodes
{
    // AS3: SelectorCodes.as::FURNI_BY_TYPE
    public static readonly FURNI_BY_TYPE: number = 0;

    // Name derived: AS3 declares this as the obfuscated `_SafeStr_10416` (value 1) on a parameterless
    // furni selector (_SafeCls_4318, forceFurniSelection) with no recoverable identity.
    // AS3: SelectorCodes.as::SELECTOR_CODE_1
    public static readonly SELECTOR_CODE_1: number = 1;

    // AS3: SelectorCodes.as::USERS_BY_TYPE
    public static readonly USERS_BY_TYPE: number = 2;

    // AS3: SelectorCodes.as::USERS_IN_TEAM
    public static readonly USERS_IN_TEAM: number = 3;

    // AS3: SelectorCodes.as::FURNI_ON_FURNI
    public static readonly FURNI_ON_FURNI: number = 4;

    // AS3: SelectorCodes.as::FURNI_FROM_SIGNAL
    public static readonly FURNI_FROM_SIGNAL: number = 5;

    // Name derived: AS3 obfuscated `_SafeStr_10356` (value 6); the furni analogue of USERS_IN_NEIGHBORHOOD.
    // AS3: SelectorCodes.as::FURNI_IN_NEIGHBORHOOD
    public static readonly FURNI_IN_NEIGHBORHOOD: number = 6;

    // Name derived: AS3 obfuscated `_SafeStr_10376` (value 7); the furni analogue of USERS_IN_AREA.
    // AS3: SelectorCodes.as::FURNI_IN_AREA
    public static readonly FURNI_IN_AREA: number = 7;

    // AS3: SelectorCodes.as::USERS_ON_FURNI
    public static readonly USERS_ON_FURNI: number = 8;

    // AS3: SelectorCodes.as::USERS_PERFORMING_ACTION
    public static readonly USERS_PERFORMING_ACTION: number = 9;

    // AS3: SelectorCodes.as::USERS_FROM_SIGNAL
    public static readonly USERS_FROM_SIGNAL: number = 10;

    // AS3: SelectorCodes.as::USERS_BY_NAME
    public static readonly USERS_BY_NAME: number = 11;

    // AS3: SelectorCodes.as::USERS_IN_NEIGHBORHOOD
    public static readonly USERS_IN_NEIGHBORHOOD: number = 12;

    // AS3: SelectorCodes.as::USERS_IN_AREA
    public static readonly USERS_IN_AREA: number = 13;

    // AS3: SelectorCodes.as::USERS_WITH_HANDITEM
    public static readonly USERS_WITH_HANDITEM: number = 14;

    // AS3: SelectorCodes.as::USERS_IN_GROUP
    public static readonly USERS_IN_GROUP: number = 15;

    // AS3: SelectorCodes.as::FURNI_WITH_ALTITUDE
    public static readonly FURNI_WITH_ALTITUDE: number = 16;

    // Name derived: AS3 obfuscated `_SafeStr_10370` (value 17); the furni analogue of USERS_WITH_VARIABLE.
    // AS3: SelectorCodes.as::FURNI_WITH_VARIABLE
    public static readonly FURNI_WITH_VARIABLE: number = 17;

    // AS3: SelectorCodes.as::USERS_WITH_VARIABLE
    public static readonly USERS_WITH_VARIABLE: number = 18;

    // AS3: SelectorCodes.as::REMOTE_SELECTOR
    public static readonly REMOTE_SELECTOR: number = 19;
}

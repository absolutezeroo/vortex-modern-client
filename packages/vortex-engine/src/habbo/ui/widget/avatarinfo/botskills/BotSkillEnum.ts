/**
 * The skill ids a rentable bot can carry — what `CommandBotComposer`'s `commandId` takes and what
 * `RentableBotMenuView` tests its skill list against.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/avatarinfo/botskills/_SafeCls_3088.as
 *
 * **The class name is DERIVED** — the AS3 class is obfuscated in every tree and the 2016 build has
 * no counterpart. Every *constant* below is the real, unobfuscated AS3 identifier, except the one
 * marked: `_SafeStr_10276` (4) is obfuscated too, and is named here after the button that sends it
 * (`RentableBotMenuView.buttonEventProc()` case "dance").
 */
export class BotSkillEnum
{
    // AS3: .../_SafeCls_3088.as::GENERIC_SKILL
    public static readonly GENERIC_SKILL: number = 0;
    // AS3: .../_SafeCls_3088.as::FIGURE_STRING
    public static readonly FIGURE_STRING: number = 1;
    // AS3: .../_SafeCls_3088.as::CHATTER_MARKOV
    public static readonly CHATTER_MARKOV: number = 2;
    // AS3: .../_SafeCls_3088.as::RANDOM_WALK
    public static readonly RANDOM_WALK: number = 3;
    // AS3: .../_SafeCls_3088.as::_SafeStr_10276 — name DERIVED from its only sender, the "dance"
    // button; obfuscated in every tree.
    public static readonly DANCE: number = 4;
    // AS3: .../_SafeCls_3088.as::CHANGE_NAME
    public static readonly CHANGE_NAME: number = 5;
    // AS3: .../_SafeCls_3088.as::SERVE_BEVERAGE
    public static readonly SERVE_BEVERAGE: number = 6;
    // AS3: .../_SafeCls_3088.as::INCLIENT_LINK
    public static readonly INCLIENT_LINK: number = 7;
    // AS3: .../_SafeCls_3088.as::NUX_PROCEED
    public static readonly NUX_PROCEED: number = 8;
    // AS3: .../_SafeCls_3088.as::NUX_TAKE_TOUR
    public static readonly NUX_TAKE_TOUR: number = 10;
    // AS3: .../_SafeCls_3088.as::NO_PICK_UP
    public static readonly NO_PICK_UP: number = 12;
    // AS3: .../_SafeCls_3088.as::NAVIGATOR_SEARCH
    public static readonly NAVIGATOR_SEARCH: number = 14;
    // AS3: .../_SafeCls_3088.as::DONATE_FURNITURE_TO_USER
    public static readonly DONATE_FURNITURE_TO_USER: number = 24;
    // AS3: .../_SafeCls_3088.as::DONATE_FURNITURE_TO_ALL
    public static readonly DONATE_FURNITURE_TO_ALL: number = 25;
}

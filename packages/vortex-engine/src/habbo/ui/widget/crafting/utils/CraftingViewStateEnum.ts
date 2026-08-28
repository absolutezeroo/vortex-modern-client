/**
 * The state ids `CraftingInfoController.setState()` switches on.
 *
 * Class name recovered from
 * `sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/ui/widget/crafting/utils/CraftingViewStateEnum.as`
 * (same value set, 0-9/999/1000, in both trees). `DEFAULT_VIEW`, `RECIPE_EMPTY`,
 * `RECIPE_INCOMPLETE`, `RECIPE_COMPLETE`, `ITEM_NOT_IN_INVENTORY`, `STATE_CRAFTING_RESULT_OK` and
 * `STATE_WORKING` are readable in the primary tree's own `_SafeCls_3039.as`; the five mixer-state
 * members (1/2/3/4/5) are obfuscated in *every* tree including PRODUCTION's own copy of this file,
 * so their names below are DERIVED from the localization keys `CraftingInfoController.setState()`
 * assigns to each — never recovered.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/crafting/utils/_SafeCls_3039.as
 */
export class CraftingViewStateEnum
{
    // AS3: .../utils/_SafeCls_3039.as::DEFAULT_VIEW
    public static readonly DEFAULT_VIEW: number = 0;

    // AS3: .../utils/_SafeCls_3039.as::_SafeStr_11258
    // Name DERIVED (obfuscated in every tree, including PRODUCTION's) from the localization key
    // it maps to in CraftingInfoController.setState(): "${crafting.info.mixer.empty}".
    public static readonly MIXER_EMPTY: number = 1;

    // AS3: .../utils/_SafeCls_3039.as::_SafeStr_11570
    // Name DERIVED from "${crafting.info.mixer.nohit}".
    public static readonly MIXER_NO_HIT: number = 2;

    // AS3: .../utils/_SafeCls_3039.as::_SafeStr_10458
    // Name DERIVED from "${crafting.info.mixer.hit}".
    public static readonly MIXER_HIT: number = 3;

    // AS3: .../utils/_SafeCls_3039.as::_SafeStr_11104
    // Name DERIVED from "crafting.info.mixer.hit.plus.others".
    public static readonly MIXER_HIT_PLUS_OTHERS: number = 4;

    // AS3: .../utils/_SafeCls_3039.as::_SafeStr_10864
    // Name DERIVED from "crafting.info.mixer.others" — other recipes match the mixer's contents,
    // but not the one currently needed.
    public static readonly MIXER_OTHERS_AVAILABLE: number = 5;

    // AS3: .../utils/_SafeCls_3039.as::RECIPE_EMPTY
    public static readonly RECIPE_EMPTY: number = 6;

    // AS3: .../utils/_SafeCls_3039.as::RECIPE_INCOMPLETE
    public static readonly RECIPE_INCOMPLETE: number = 7;

    // AS3: .../utils/_SafeCls_3039.as::RECIPE_COMPLETE
    public static readonly RECIPE_COMPLETE: number = 8;

    // AS3: .../utils/_SafeCls_3039.as::ITEM_NOT_IN_INVENTORY
    public static readonly ITEM_NOT_IN_INVENTORY: number = 9;

    // AS3: .../utils/_SafeCls_3039.as::STATE_CRAFTING_RESULT_OK
    public static readonly STATE_CRAFTING_RESULT_OK: number = 999;

    // AS3: .../utils/_SafeCls_3039.as::STATE_WORKING
    public static readonly STATE_WORKING: number = 1000;
}

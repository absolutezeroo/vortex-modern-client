/**
 * The three rule modes a wired trading contract can use, read as `TradeRequirementRules.type`.
 *
 * The mode decides what is read after it: mode 1 is followed by a multiplier, mode 2 by an
 * auto-multiplier ceiling, mode 0 by neither.
 *
 * **Renamed on 2026-08-12.** This class shipped as `TradeRequirementRule`, which is the name of a
 * *different and unobfuscated* AS3 class in the same package — the one that actually holds the
 * requirement nodes. Taking that name left the real class unportable, so the constants holder was
 * moved aside. Its own name is unrecoverable (obfuscated in every tree and it postdates the 2016
 * build), so `TradeRequirementRulesType` is DERIVED from the single field it discriminates.
 *
 * `TYPE_0`/`TYPE_1`/`TYPE_2` keep the AS3 ordinals and stay deliberately unnamed: the three member
 * names are obfuscated too, and inventing semantic ones would be a guess dressed as recovery. What
 * is observed rather than guessed, from `InitiateTransaction`: TYPE_0 disables the amount section,
 * TYPE_2 switches the amount title to the "multiplier_selection2" variant.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/trade/requirements/rules/_SafeCls_4486.as
 */
export class TradeRequirementRulesType
{
    // AS3: _SafeCls_4486.as::_SafeStr_10448 (name unrecoverable; ordinal preserved)
    public static readonly TYPE_0: number = 0;

    // AS3: _SafeCls_4486.as::_SafeStr_10226 (the mode that is followed by a multiplier)
    public static readonly TYPE_1: number = 1;

    // AS3: _SafeCls_4486.as::_SafeStr_8654 (the mode that is followed by an auto-multiplier max)
    public static readonly TYPE_2: number = 2;
}

/**
 * WiredContextDataType — the section-type tags carried inside a WiredContext message. Each entry the
 * message enumerates is preceded by one of these ints, telling WiredContext which sub-DTO to parse
 * and which context field to populate (see WiredContext's switch on the section type).
 *
 * Name derived: the enum's class and every constant are obfuscated in WIN63 (class _SafeCls_4472,
 * constants _SafeStr_*); no counterpart exists in vortex-flash-client. Each constant name is derived
 * from the WiredContext getter its branch feeds (e.g. value 0 -> roomVariablesList/AllVariablesInRoom).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/incoming/userdefinedroomevents/wiredcontext/_SafeCls_4472.as
 */
export class WiredContextDataType
{
    // AS3: _SafeCls_4472.as::_SafeStr_10442 (value 0) — name derived: WiredContext branch builds
    // AllVariablesInRoom into roomVariablesList.
    static readonly ALL_VARIABLES_IN_ROOM: number = 0;

    // AS3: _SafeCls_4472.as::_SafeStr_10336 (value 1) — name derived: WiredContext branch builds
    // VariableInfoAndHolders into furniVariableInfo.
    static readonly FURNI_VARIABLE_INFO: number = 1;

    // AS3: _SafeCls_4472.as::_SafeStr_10369 (value 2) — name derived: WiredContext branch builds
    // VariableInfoAndHolders into userVariableInfo.
    static readonly USER_VARIABLE_INFO: number = 2;

    // AS3: _SafeCls_4472.as::_SafeStr_10438 (value 3) — name derived: WiredContext branch builds
    // VariableInfoAndValue into globalVariableInfo.
    static readonly GLOBAL_VARIABLE_INFO: number = 3;

    // AS3: _SafeCls_4472.as::_SafeStr_10388 (value 4) — name derived: WiredContext branch builds
    // SharedVariableList into referenceVariablesList.
    static readonly REFERENCE_VARIABLE_LIST: number = 4;

    // AS3: _SafeCls_4472.as::_SafeStr_10455 (value 5) — name derived: WiredContext branch builds
    // VariableList into rulesetVariables.
    static readonly RULESET_VARIABLES: number = 5;

    // AS3: _SafeCls_4472.as::_SafeStr_10367 (value 6) — name derived: WiredContext branch builds
    // SharedGlobalPlaceholderList into referencePlaceholderList.
    static readonly REFERENCE_PLACEHOLDER_LIST: number = 6;
}

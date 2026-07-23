/**
 * QuantifierType — the condition quantifier kinds: what a quantifiable condition counts against a
 * threshold (none, furni, users, or variables). Read as a byte in ConditionDefinition.
 *
 * Name derived: fully obfuscated in AS3 (class `_SafeCls_3026`) and the members carry no recoverable
 * names; NONE/FURNI/USERS/VARIABLES follow the AS3 ordinal values and getQuantifierKey's usage
 * ("furni"/"users"/"variables").
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/incoming/userdefinedroomevents/_SafeCls_3026.as
 */
export class QuantifierType
{
    // AS3: _SafeCls_3026.as::_SafeStr_10247 (name derived: no quantifier)
    public static readonly NONE: number = 0;

    // AS3: _SafeCls_3026.as::_SafeStr_10389 (name derived: count furni)
    public static readonly FURNI: number = 1;

    // AS3: _SafeCls_3026.as::_SafeStr_10374 (name derived: count users)
    public static readonly USERS: number = 2;

    // AS3: _SafeCls_3026.as::_SafeStr_10433 (name derived: count variables)
    public static readonly VARIABLES: number = 3;
}

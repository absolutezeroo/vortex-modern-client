/**
 * VariableCodes — the server wired-variable type ids returned by each concrete variable type's `code`
 * getter. Variable furni declare a variable of a given scope/purpose.
 *
 * AS3 declares these as mutable `public static var`; they are never reassigned, so the port makes them
 * `readonly`. Four are obfuscated with no readable counterpart, named from their form's localization
 * keys / holder type: FURNI_VARIABLE (0, the furni-scoped variable), QUEST_VARIABLE (5, quest_name),
 * QUEST_CHAIN_VARIABLE (6, quest_chain_name) and DAILY_TASK_VARIABLE (8, daily_task_name).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/variables/VariableCodes.as
 */
export class VariableCodes
{
    // Name derived: AS3 obfuscated `_SafeStr_10393` (value 0); the furni-scoped variable.
    // AS3: VariableCodes.as::FURNI_VARIABLE
    public static readonly FURNI_VARIABLE: number = 0;

    // AS3: VariableCodes.as::USER_VARIABLE
    public static readonly USER_VARIABLE: number = 1;

    // AS3: VariableCodes.as::GLOBAL_VARIABLE
    public static readonly GLOBAL_VARIABLE: number = 2;

    // AS3: VariableCodes.as::CONTEXT_VARIABLE
    public static readonly CONTEXT_VARIABLE: number = 3;

    // AS3: VariableCodes.as::REFERENCE_VARIABLE
    public static readonly REFERENCE_VARIABLE: number = 4;

    // Name derived: AS3 obfuscated `_SafeStr_10328` (value 5); the quest_name variable.
    // AS3: VariableCodes.as::QUEST_VARIABLE
    public static readonly QUEST_VARIABLE: number = 5;

    // Name derived: AS3 obfuscated `_SafeStr_10335` (value 6); the quest_chain_name variable.
    // AS3: VariableCodes.as::QUEST_CHAIN_VARIABLE
    public static readonly QUEST_CHAIN_VARIABLE: number = 6;

    // AS3: VariableCodes.as::ECHO_VARIABLE
    public static readonly ECHO_VARIABLE: number = 7;

    // Name derived: AS3 obfuscated `_SafeStr_10320` (value 8); the daily_task_name variable.
    // AS3: VariableCodes.as::DAILY_TASK_VARIABLE
    public static readonly DAILY_TASK_VARIABLE: number = 8;
}

/**
 * TriggerConfCodes — the server wired-trigger type ids returned by each concrete trigger config's
 * `code` getter.
 *
 * AS3 declares these as mutable `public static var`; they are never reassigned, so the port makes them
 * `readonly`. Codes 5 is unused (gap in the AS3 enumeration).
 *
 * Two codes are recovered from the 2016 PRODUCTION build's WiredTriggerType (obfuscated as _SafeStr_*
 * in WIN63): AVATAR_WALKS_ON_FURNI (1) and AVATAR_WALKS_OFF_FURNI (2). Codes 16 and 21 postdate 2016
 * and are named by value (TRIGGER_CODE_16/21) — 16 drives a Dropdown-based action/dance/sign trigger
 * (deferred), 21 a parameterless trigger with no recoverable identity.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/triggerconfs/TriggerConfCodes.as
 */
export class TriggerConfCodes
{
    // AS3: TriggerConfCodes.as::AVATAR_SAYS_SOMETHING
    public static readonly AVATAR_SAYS_SOMETHING: number = 0;

    // AS3: TriggerConfCodes.as::AVATAR_WALKS_ON_FURNI (recovered from PRODUCTION WiredTriggerType=1)
    public static readonly AVATAR_WALKS_ON_FURNI: number = 1;

    // AS3: TriggerConfCodes.as::AVATAR_WALKS_OFF_FURNI (recovered from PRODUCTION WiredTriggerType=2)
    public static readonly AVATAR_WALKS_OFF_FURNI: number = 2;

    // AS3: TriggerConfCodes.as::TRIGGER_ONCE
    public static readonly TRIGGER_ONCE: number = 3;

    // AS3: TriggerConfCodes.as::USE_STUFF
    public static readonly USE_STUFF: number = 4;

    // AS3: TriggerConfCodes.as::TRIGGER_PERIODICALLY
    public static readonly TRIGGER_PERIODICALLY: number = 6;

    // AS3: TriggerConfCodes.as::AVATAR_ENTERS_ROOM
    public static readonly AVATAR_ENTERS_ROOM: number = 7;

    // AS3: TriggerConfCodes.as::GAME_STARTS
    public static readonly GAME_STARTS: number = 8;

    // AS3: TriggerConfCodes.as::GAME_ENDS
    public static readonly GAME_ENDS: number = 9;

    // AS3: TriggerConfCodes.as::SCORE_ACHIEVED
    public static readonly SCORE_ACHIEVED: number = 10;

    // AS3: TriggerConfCodes.as::AVATAR_CAUGHT
    public static readonly AVATAR_CAUGHT: number = 11;

    // AS3: TriggerConfCodes.as::PERIODIC_LONG
    public static readonly PERIODIC_LONG: number = 12;

    // AS3: TriggerConfCodes.as::BOT_DESTINATION_REACHED
    public static readonly BOT_DESTINATION_REACHED: number = 13;

    // AS3: TriggerConfCodes.as::BOT_AVATAR_REACHED
    public static readonly BOT_AVATAR_REACHED: number = 14;

    // AS3: TriggerConfCodes.as::CLOCK_REACH_TIME
    public static readonly CLOCK_REACH_TIME: number = 15;

    // Name derived: AS3 declares this as the obfuscated `_SafeStr_10352` (value 16); it drives a
    // Dropdown-based action/dance/sign trigger (type deferred). No readable counterpart in any tree.
    // AS3: TriggerConfCodes.as::TRIGGER_CODE_16
    public static readonly TRIGGER_CODE_16: number = 16;

    // AS3: TriggerConfCodes.as::RECEIVE_SIGNAL
    public static readonly RECEIVE_SIGNAL: number = 17;

    // AS3: TriggerConfCodes.as::AVATAR_CLICKS_FURNI
    public static readonly AVATAR_CLICKS_FURNI: number = 18;

    // AS3: TriggerConfCodes.as::PERIODIC_SHORT
    public static readonly PERIODIC_SHORT: number = 19;

    // AS3: TriggerConfCodes.as::STATE_CHANGE
    public static readonly STATE_CHANGE: number = 20;

    // Name derived: AS3 declares this as the obfuscated `_SafeStr_10364` (value 21) on a parameterless
    // trigger (_SafeCls_4341) with no recoverable identity in any tree.
    // AS3: TriggerConfCodes.as::TRIGGER_CODE_21
    public static readonly TRIGGER_CODE_21: number = 21;

    // AS3: TriggerConfCodes.as::VARIABLE_UPDATE
    public static readonly VARIABLE_UPDATE: number = 22;

    // AS3: TriggerConfCodes.as::AVATAR_LEAVES_ROOM
    public static readonly AVATAR_LEAVES_ROOM: number = 23;

    // AS3: TriggerConfCodes.as::USER_CLICKS_USER
    public static readonly USER_CLICKS_USER: number = 24;

    // AS3: TriggerConfCodes.as::TRANSACTION_COMPLETED
    public static readonly TRANSACTION_COMPLETED: number = 25;

    // AS3: TriggerConfCodes.as::TRANSACTION_FAILED
    public static readonly TRANSACTION_FAILED: number = 26;
}

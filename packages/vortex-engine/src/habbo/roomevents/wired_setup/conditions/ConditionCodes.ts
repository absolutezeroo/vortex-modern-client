/**
 * ConditionCodes — the server wired-condition type ids returned by each concrete condition type's
 * `code` getter. Positive/negative pairs share a base name with a `NOT_` prefix for the negation.
 *
 * AS3 declares these as mutable `public static var`; they are never reassigned, so the port makes them
 * `readonly`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/conditions/ConditionCodes.as
 */
export class ConditionCodes
{
    // AS3: ConditionCodes.as::STATES_MATCH
    public static readonly STATES_MATCH: number = 0;

    // AS3: ConditionCodes.as::FURNIS_HAVE_AVATARS
    public static readonly FURNIS_HAVE_AVATARS: number = 1;

    // AS3: ConditionCodes.as::TRIGGERER_IS_ON_FURNI
    public static readonly TRIGGERER_IS_ON_FURNI: number = 2;

    // AS3: ConditionCodes.as::TIME_ELAPSED_MORE
    public static readonly TIME_ELAPSED_MORE: number = 3;

    // AS3: ConditionCodes.as::TIME_ELAPSED_LESS
    public static readonly TIME_ELAPSED_LESS: number = 4;

    // AS3: ConditionCodes.as::USER_COUNT_IN
    public static readonly USER_COUNT_IN: number = 5;

    // AS3: ConditionCodes.as::ACTOR_IS_IN_TEAM
    public static readonly ACTOR_IS_IN_TEAM: number = 6;

    // AS3: ConditionCodes.as::HAS_STACKED_FURNIS
    public static readonly HAS_STACKED_FURNIS: number = 7;

    // AS3: ConditionCodes.as::STUFF_TYPE_MATCHES
    public static readonly STUFF_TYPE_MATCHES: number = 8;

    // AS3: ConditionCodes.as::ACTOR_IS_GROUP_MEMBER
    public static readonly ACTOR_IS_GROUP_MEMBER: number = 10;

    // AS3: ConditionCodes.as::ACTOR_IS_WEARING_BADGE
    public static readonly ACTOR_IS_WEARING_BADGE: number = 11;

    // AS3: ConditionCodes.as::ACTOR_IS_WEARING_EFFECT
    public static readonly ACTOR_IS_WEARING_EFFECT: number = 12;

    // AS3: ConditionCodes.as::NOT_STATES_MATCH
    public static readonly NOT_STATES_MATCH: number = 13;

    // AS3: ConditionCodes.as::NOT_FURNIS_HAVE_AVATARS
    public static readonly NOT_FURNIS_HAVE_AVATARS: number = 14;

    // AS3: ConditionCodes.as::NOT_TRIGGERER_IS_ON_FURNI
    public static readonly NOT_TRIGGERER_IS_ON_FURNI: number = 15;

    // AS3: ConditionCodes.as::NOT_USER_COUNT_IN
    public static readonly NOT_USER_COUNT_IN: number = 16;

    // AS3: ConditionCodes.as::NOT_ACTOR_IS_IN_TEAM
    public static readonly NOT_ACTOR_IS_IN_TEAM: number = 17;

    // AS3: ConditionCodes.as::NOT_HAS_STACKED_FURNIS
    public static readonly NOT_HAS_STACKED_FURNIS: number = 18;

    // AS3: ConditionCodes.as::NOT_STUFF_TYPE_MATCHES
    public static readonly NOT_STUFF_TYPE_MATCHES: number = 19;

    // AS3: ConditionCodes.as::NOT_ACTOR_IS_GROUP_MEMBER
    public static readonly NOT_ACTOR_IS_GROUP_MEMBER: number = 21;

    // AS3: ConditionCodes.as::NOT_ACTOR_IS_WEARING_BADGE
    public static readonly NOT_ACTOR_IS_WEARING_BADGE: number = 22;

    // AS3: ConditionCodes.as::NOT_ACTOR_IS_WEARING_EFFECT
    public static readonly NOT_ACTOR_IS_WEARING_EFFECT: number = 23;

    // AS3: ConditionCodes.as::DATE_RANGE_ACTIVE
    public static readonly DATE_RANGE_ACTIVE: number = 24;

    // AS3: ConditionCodes.as::ACTOR_HAS_HANDITEM
    public static readonly ACTOR_HAS_HANDITEM: number = 25;

    // AS3: ConditionCodes.as::TRIGGERER_MATCHES
    public static readonly TRIGGERER_MATCHES: number = 26;

    // AS3: ConditionCodes.as::NOT_TRIGGERER_MATCHES
    public static readonly NOT_TRIGGERER_MATCHES: number = 27;

    // AS3: ConditionCodes.as::TIME_MATCHES
    public static readonly TIME_MATCHES: number = 28;

    // AS3: ConditionCodes.as::DATE_MATCHES
    public static readonly DATE_MATCHES: number = 29;

    // AS3: ConditionCodes.as::NOT_HAS_HANDITEM
    public static readonly NOT_HAS_HANDITEM: number = 30;

    // AS3: ConditionCodes.as::TEAM_IS_WINNING
    public static readonly TEAM_IS_WINNING: number = 31;

    // AS3: ConditionCodes.as::PERFORMING_ACTION
    public static readonly PERFORMING_ACTION: number = 32;

    // AS3: ConditionCodes.as::NOT_PERFORMING_ACTION
    public static readonly NOT_PERFORMING_ACTION: number = 33;

    // AS3: ConditionCodes.as::TEAM_HAS_SCORE
    public static readonly TEAM_HAS_SCORE: number = 34;

    // AS3: ConditionCodes.as::CLOCK_TIME_MATCHES
    public static readonly CLOCK_TIME_MATCHES: number = 35;

    // AS3: ConditionCodes.as::FURNI_HAS_ALTITUDE
    public static readonly FURNI_HAS_ALTITUDE: number = 36;

    // AS3: ConditionCodes.as::USER_DIRECTION
    public static readonly USER_DIRECTION: number = 37;

    // AS3: ConditionCodes.as::INPUT_SOURCE_QUANTITY
    public static readonly INPUT_SOURCE_QUANTITY: number = 38;

    // AS3: ConditionCodes.as::CAN_PERFORM_MOVE
    public static readonly CAN_PERFORM_MOVE: number = 39;

    // Name derived: AS3 declares this as the obfuscated `_SafeStr_10311` (value 40, used by the
    // has-variable condition _SafeCls_4236); named HAS_VARIABLE as the positive of NOT_HAS_VARIABLE (41).
    // AS3: ConditionCodes.as::HAS_VARIABLE
    public static readonly HAS_VARIABLE: number = 40;

    // AS3: ConditionCodes.as::NOT_HAS_VARIABLE
    public static readonly NOT_HAS_VARIABLE: number = 41;

    // AS3: ConditionCodes.as::VARIABLE_VALUE
    public static readonly VARIABLE_VALUE: number = 42;

    // AS3: ConditionCodes.as::VARIABLE_AGE
    public static readonly VARIABLE_AGE: number = 43;

    // AS3: ConditionCodes.as::USER_LEVEL
    public static readonly USER_LEVEL: number = 44;

    // AS3: ConditionCodes.as::CHEST_HAS_ITEMS
    public static readonly CHEST_HAS_ITEMS: number = 45;

    // AS3: ConditionCodes.as::CHEST_HAS_ITEM_TYPES
    public static readonly CHEST_HAS_ITEM_TYPES: number = 46;
}

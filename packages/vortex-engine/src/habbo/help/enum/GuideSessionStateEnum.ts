/**
 * Guide session state constants
 *
 * Defines the possible states for guide sessions, including user flow,
 * guide flow, and guardian chat review flow.
 *
 * @see source_as_win63/habbo/help/enum/GuideSessionStateEnum.as
 */
export class GuideSessionStateEnum
{
    // AS3: .../src/com/sulake/habbo/help/enum/GuideSessionStateEnum.as::CLOSED
    public static readonly CLOSED: string = '';
    // AS3: .../src/com/sulake/habbo/help/enum/GuideSessionStateEnum.as::ERROR
    public static readonly ERROR: string = 'error_window';
    // AS3: .../src/com/sulake/habbo/help/enum/GuideSessionStateEnum.as::REJECTED
    public static readonly REJECTED: string = 'rejected_window';

    // AS3: .../src/com/sulake/habbo/help/enum/GuideSessionStateEnum.as::USER_CREATE
    public static readonly USER_CREATE: string = 'user_create';
    // AS3: .../src/com/sulake/habbo/help/enum/GuideSessionStateEnum.as::USER_PENDING
    public static readonly USER_PENDING: string = 'user_pending';
    // AS3: .../src/com/sulake/habbo/help/enum/GuideSessionStateEnum.as::USER_ONGOING
    public static readonly USER_ONGOING: string = 'user_ongoing';
    // AS3: .../src/com/sulake/habbo/help/enum/GuideSessionStateEnum.as::USER_FEEDBACK
    public static readonly USER_FEEDBACK: string = 'user_feedback';
    // AS3: .../src/com/sulake/habbo/help/enum/GuideSessionStateEnum.as::USER_THANKS
    public static readonly USER_THANKS: string = 'user_thanks';
    // AS3: .../src/com/sulake/habbo/help/enum/GuideSessionStateEnum.as::USER_GUIDE_DISCONNECTED
    public static readonly USER_GUIDE_DISCONNECTED: string = 'user_guide_disconnected';

    // AS3: .../src/com/sulake/habbo/help/enum/GuideSessionStateEnum.as::GUIDE_TOOL
    public static readonly GUIDE_TOOL: string = 'guide_tool';
    // AS3: .../src/com/sulake/habbo/help/enum/GuideSessionStateEnum.as::GUIDE_ACCEPT
    public static readonly GUIDE_ACCEPT: string = 'guide_accept';
    // AS3: .../src/com/sulake/habbo/help/enum/GuideSessionStateEnum.as::GUIDE_ONGOING
    public static readonly GUIDE_ONGOING: string = 'guide_ongoing';
    // AS3: .../src/com/sulake/habbo/help/enum/GuideSessionStateEnum.as::GUIDE_CLOSED
    public static readonly GUIDE_CLOSED: string = 'guide_closed';

    // AS3: .../src/com/sulake/habbo/help/enum/GuideSessionStateEnum.as::GUARDIAN_CHAT_REVIEW_ACCEPT
    public static readonly GUARDIAN_CHAT_REVIEW_ACCEPT: string = 'guardian_chat_review_accept';
    // AS3: .../src/com/sulake/habbo/help/enum/GuideSessionStateEnum.as::GUARDIAN_CHAT_REVIEW_WAIT_FOR_VOTERS
    public static readonly GUARDIAN_CHAT_REVIEW_WAIT_FOR_VOTERS: string = 'guardian_chat_review_wait_for_voters';
    // AS3: .../src/com/sulake/habbo/help/enum/GuideSessionStateEnum.as::GUARDIAN_CHAT_REVIEW_VOTE
    public static readonly GUARDIAN_CHAT_REVIEW_VOTE: string = 'guardian_chat_review_vote';
    // AS3: .../src/com/sulake/habbo/help/enum/GuideSessionStateEnum.as::GUARDIAN_CHAT_REVIEW_WAIT_FOR_RESULTS
    public static readonly GUARDIAN_CHAT_REVIEW_WAIT_FOR_RESULTS: string = 'guardian_chat_review_wait_for_results';
    // AS3: .../src/com/sulake/habbo/help/enum/GuideSessionStateEnum.as::GUARDIAN_CHAT_REVIEW_RESULTS
    public static readonly GUARDIAN_CHAT_REVIEW_RESULTS: string = 'guardian_chat_review_results';
}

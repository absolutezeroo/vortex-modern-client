import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * One task inside a talent-track level — an achievement the user has to reach.
 *
 * **The name is DERIVED** — obfuscated in every tree (`_SafeCls_4445` / `class_3765`, and
 * PRODUCTION's `_Str_2821` is obfuscated too); named for the `tasks` collection that holds it.
 *
 * **The read order is not the accessor order**, and the two disagree in a way that silently
 * desyncs the whole packet if copied wrong: the wire sends `achievementId, requiredLevel,
 * badgeCode, state, currentScore, totalScore`, while AS3 declares `get state()` first and has it
 * return the *fourth* field read. Fields below are declared in wire order for that reason.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2740/_SafeCls_4445.as
 */
export class TalentTrackTask
{
    /** Derived name — `_SafeStr_10959`. */
    // AS3: _SafeCls_4445.as::_SafeStr_10959
    public static readonly HABBO_WAY_GRADUATE_1: string = 'ACH_HabboWayGraduate1';

    /** Derived name — `_SafeStr_10978`. */
    // AS3: _SafeCls_4445.as::_SafeStr_10978
    public static readonly GUIDE_GROUP_MEMBER_1: string = 'ACH_GuideGroupMember1';

    /** Derived name — `_SafeStr_11028`. */
    // AS3: _SafeCls_4445.as::_SafeStr_11028
    public static readonly SAFETY_QUIZ_GRADUATE_1: string = 'ACH_SafetyQuizGraduate1';

    /** Derived name — `_SafeStr_10743`. */
    // AS3: _SafeCls_4445.as::_SafeStr_10743
    public static readonly EMAIL_VERIFICATION_1: string = 'ACH_EmailVerification1';

    // AS3: _SafeCls_4445.as::ROOM_ENTRY_1
    public static readonly ROOM_ENTRY_1: string = 'ACH_RoomEntry1';

    // AS3: _SafeCls_4445.as::ROOM_ENTRY_2
    public static readonly ROOM_ENTRY_2: string = 'ACH_RoomEntry2';

    /** Derived name — `_SafeStr_10472`. */
    // AS3: _SafeCls_4445.as::_SafeStr_10472
    public static readonly AVATAR_LOOKS_1: string = 'ACH_AvatarLooks1';

    /** Derived name — `_SafeStr_10713`. */
    // AS3: _SafeCls_4445.as::_SafeStr_10713
    public static readonly GUIDE_ADVERTISEMENT_READER_1: string = 'ACH_GuideAdvertisementReader1';

    // AS3: _SafeCls_4445.as::get achievementId()
    public readonly achievementId: number;

    // AS3: _SafeCls_4445.as::get requiredLevel()
    public readonly requiredLevel: number;

    // AS3: _SafeCls_4445.as::get badgeCode()
    public readonly badgeCode: string;

    // AS3: _SafeCls_4445.as::get state()
    public readonly state: number;

    // AS3: _SafeCls_4445.as::get currentScore()
    public readonly currentScore: number;

    // AS3: _SafeCls_4445.as::get totalScore()
    public readonly totalScore: number;

    // AS3: _SafeCls_4445.as::_SafeCls_4445()
    constructor(wrapper: IMessageDataWrapper)
    {
        this.achievementId = wrapper.readInt();
        this.requiredLevel = wrapper.readInt();
        this.badgeCode = wrapper.readString();
        this.state = wrapper.readInt();
        this.currentScore = wrapper.readInt();
        this.totalScore = wrapper.readInt();
    }

    /** The four one-shot tasks show a tick rather than an "x of y" bar. */
    // AS3: _SafeCls_4445.as::hasProgressDisplay()
    public hasProgressDisplay(): boolean
    {
        switch(this.badgeCode)
        {
            case TalentTrackTask.HABBO_WAY_GRADUATE_1:
            case TalentTrackTask.SAFETY_QUIZ_GRADUATE_1:
            case TalentTrackTask.EMAIL_VERIFICATION_1:
            case TalentTrackTask.AVATAR_LOOKS_1:
                return false;
            default:
                return true;
        }
    }
}

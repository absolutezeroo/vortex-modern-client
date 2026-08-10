/**
 * The moderation state a thread or a post can be put in, and the value the client sends to ask for
 * it. It is the last argument of both `ModerateThreadMessageComposer` and
 * `ModerateMessageMessageComposer`.
 *
 * The gaps in the numbering are AS3's: 10 is what a group's own moderator can do, 20 is reserved
 * for staff, and 1 undoes either.
 *
 * The class name is recovered from the 2016 tree, where the file is `ForumModerationState.as`; the
 * constant names come from the primary, which obfuscates the class to `_SafeCls_2852` but leaves
 * its members readable. Neither is derived.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/groupforums/_SafeCls_2852.as
 */
export class ForumModerationState
{
    // AS3: .../src/com/sulake/habbo/friendbar/groupforums/_SafeCls_2852.as::DEFAULT_STATE
    public static readonly DEFAULT_STATE: number = 0;

    // AS3: .../src/com/sulake/habbo/friendbar/groupforums/_SafeCls_2852.as::RESTORED_BY_ADMIN
    public static readonly RESTORED_BY_ADMIN: number = 1;

    // AS3: .../src/com/sulake/habbo/friendbar/groupforums/_SafeCls_2852.as::HIDDEN_BY_ADMIN
    public static readonly HIDDEN_BY_ADMIN: number = 10;

    // AS3: .../src/com/sulake/habbo/friendbar/groupforums/_SafeCls_2852.as::PERMANENTLY_HIDDEN_BY_MOD
    public static readonly PERMANENTLY_HIDDEN_BY_MOD: number = 20;
}

/**
 * FriendListTabEnum
 *
 * The three tab ids, plus the id the window reports when no tab is open at all —
 * `toggleSelected()` clears every selection rather than tracking a closed flag, so
 * "closed" is a fourth value in the same space.
 *
 * The primary tree obfuscates this class to `_SafeCls_1911` and no tree recovers it
 * (`win63_version/habbo/friendlist/class_2040.as` holds the same constants under its
 * own scheme; the 2016 PRODUCTION build has no equivalent). **The name
 * `FriendListTabEnum` is derived** from the constants it carries.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendlist/_SafeCls_1911.as
 */
export class FriendListTabEnum
{
    // AS3: .../_SafeCls_1911.as::VIEW_CLOSED
    static readonly VIEW_CLOSED: number = 0;

    // AS3: .../_SafeCls_1911.as::TABID_FRIENDS
    static readonly TABID_FRIENDS: number = 1;

    // AS3: .../_SafeCls_1911.as::TABID_FRIEND_REQUESTS
    static readonly TABID_FRIEND_REQUESTS: number = 2;

    // AS3: .../_SafeCls_1911.as::TABID_SEARCH
    static readonly TABID_SEARCH: number = 3;
}

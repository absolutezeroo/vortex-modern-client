/**
 * IFriendRequest
 *
 * A pending request as the friend bar shows it — three fields, no state: the bar only
 * lists them and hands the accept/decline back to `IHabboFriendBarData`, unlike the
 * friend list window's own `FriendRequest`, which tracks an answered state per row.
 *
 * The primary tree obfuscates this interface to `_SafeCls_3645` and no tree recovers
 * it. **The name `IFriendRequest` is derived**, from its sole implementor
 * `FriendRequest` (unobfuscated) in this same package.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/data/_SafeCls_3645.as
 */
export interface IFriendRequest
{
    // AS3: .../data/_SafeCls_3645.as::get id()
    readonly id: number;

    // AS3: .../data/_SafeCls_3645.as::get name()
    readonly name: string;

    // AS3: .../data/_SafeCls_3645.as::get figure()
    readonly figure: string;
}

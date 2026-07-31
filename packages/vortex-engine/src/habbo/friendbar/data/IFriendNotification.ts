/**
 * IFriendNotification
 *
 * One badge queued on a friend's slot in the friend bar — an unread message, a room
 * event, an achievement. `viewOnce` decides whether showing it consumes it.
 *
 * The primary tree obfuscates this interface to `_SafeCls_3113` and no tree recovers
 * it. **The name `IFriendNotification` is derived**, from its sole implementor
 * `FriendNotification` (unobfuscated).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/data/_SafeCls_3113.as
 */
export interface IFriendNotification
{
    // AS3: .../data/_SafeCls_3113.as::get typeCode()
    typeCode: number;

    // AS3: .../data/_SafeCls_3113.as::get message()
    message: string;

    // AS3: .../data/_SafeCls_3113.as::get viewOnce()
    viewOnce: boolean;
}

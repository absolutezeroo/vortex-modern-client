import type {IFriendNotification} from './IFriendNotification';

/**
 * IFriendEntity
 *
 * A friend as the friend bar sees one. Distinct from `habbo/friendlist`'s `IFriend`:
 * the bar carries its own notification queue and a rolling log-event id, and does not
 * expose the relationship/club fields the list window needs.
 *
 * The primary tree obfuscates this interface to `_SafeCls_2753` and no tree recovers
 * it. **The name `IFriendEntity` is derived**, from its sole implementor
 * `FriendEntity` (unobfuscated).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/data/_SafeCls_2753.as
 */
export interface IFriendEntity
{
    // AS3: .../data/_SafeCls_2753.as::get id()
    readonly id: number;

    // AS3: .../data/_SafeCls_2753.as::get name()
    readonly name: string;

    // AS3: .../data/_SafeCls_2753.as::get gender()
    readonly gender: number;

    // AS3: .../data/_SafeCls_2753.as::get online()
    readonly online: boolean;

    // AS3: .../data/_SafeCls_2753.as::get allowFollow()
    readonly allowFollow: boolean;

    // AS3: .../data/_SafeCls_2753.as::get figure()
    readonly figure: string;

    // AS3: .../data/_SafeCls_2753.as::get categoryId()
    readonly categoryId: number;

    // AS3: .../data/_SafeCls_2753.as::get motto()
    readonly motto: string;

    // AS3: .../data/_SafeCls_2753.as::get lastAccess()
    readonly lastAccess: string;

    // AS3: .../data/_SafeCls_2753.as::get realName()
    readonly realName: string;

    // AS3: .../data/_SafeCls_2753.as::get notifications()
    readonly notifications: IFriendNotification[];

    // AS3: .../data/_SafeCls_2753.as::get logEventId()
    logEventId: number;

    // AS3: .../data/_SafeCls_2753.as::getNextLogEventId()
    getNextLogEventId(): number;
}

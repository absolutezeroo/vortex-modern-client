import type {IFriendNotification} from '../data/IFriendNotification';

/**
 * NotificationEvent
 *
 * A badge was raised on one friend's slot. Carries the friend and the badge itself, so
 * the view repaints that slot alone rather than the whole bar.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/events/NotificationEvent.as
 */
export class NotificationEvent
{
    // AS3: .../events/NotificationEvent.as::FRIEND_NOTIFICATION_EVENT
    static readonly FRIEND_NOTIFICATION_EVENT: string = 'FBE_NOTIFICATION_EVENT';

    // AS3: .../events/NotificationEvent.as::NotificationEvent()
    constructor(friendId: number, notification: IFriendNotification)
    {
        this.friendId = friendId;
        this.notification = notification;
    }

    // AS3: .../events/NotificationEvent.as::friendId
    friendId: number;

    // AS3: .../events/NotificationEvent.as::notification
    notification: IFriendNotification;

    // AS3: flash.events.Event::get type()
    get type(): string
    {
        return NotificationEvent.FRIEND_NOTIFICATION_EVENT;
    }
}

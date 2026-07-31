/**
 * FindFriendsNotificationEvent
 *
 * Result of the "find new friends" button — the server either matched somebody or it
 * did not, and the bar shows one of two messages.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/events/FindFriendsNotificationEvent.as
 */
export class FindFriendsNotificationEvent
{
    // AS3: .../events/FindFriendsNotificationEvent.as::TYPE
    static readonly TYPE: string = 'FIND_FRIENDS_RESULT';

    // AS3: .../events/FindFriendsNotificationEvent.as::FindFriendsNotificationEvent()
    constructor(success: boolean)
    {
        this._success = success;
    }

    // AS3: .../events/FindFriendsNotificationEvent.as::_SafeStr_7256
    private _success: boolean;

    // AS3: .../events/FindFriendsNotificationEvent.as::get success()
    get success(): boolean
    {
        return this._success;
    }

    // AS3: flash.events.Event::get type()
    get type(): string
    {
        return FindFriendsNotificationEvent.TYPE;
    }
}

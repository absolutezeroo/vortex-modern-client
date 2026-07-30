/**
 * FriendRequestUpdateEvent
 *
 * The pending-request list changed. Also carries no payload — the view re-reads
 * `getFriendRequestList()`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/events/FriendRequestUpdateEvent.as
 */
export class FriendRequestUpdateEvent
{
    // AS3: .../events/FriendRequestUpdateEvent.as::FRIEND_REQUEST_UPDATE
    static readonly FRIEND_REQUEST_UPDATE: string = 'FBE_REQUESTS';

    // AS3: flash.events.Event::get type()
    get type(): string
    {
        return FriendRequestUpdateEvent.FRIEND_REQUEST_UPDATE;
    }
}

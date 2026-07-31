/**
 * FriendBarUpdateEvent
 *
 * The friend collection changed — added, removed, reordered. The view rebuilds its
 * slots from `IHabboFriendBarData` on this; it carries no payload.
 *
 * AS3 extends `flash.events.Event`; this port's components emit plain payload classes
 * on an eventemitter3 bus, so the type constant is what is emitted under.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/events/FriendBarUpdateEvent.as
 */
export class FriendBarUpdateEvent
{
    // AS3: .../events/FriendBarUpdateEvent.as::FRIEND_LIST_UPDATED
    static readonly FRIEND_LIST_UPDATED: string = 'FBE_UPDATED';

    // AS3: flash.events.Event::get type()
    get type(): string
    {
        return FriendBarUpdateEvent.FRIEND_LIST_UPDATED;
    }
}

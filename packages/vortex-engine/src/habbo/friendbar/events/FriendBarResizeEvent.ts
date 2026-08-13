/**
 * Friend bar resize event.
 *
 * Dispatched when the bottom/friend bar area changes size.
 */
// AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/events/FriendBarResizeEvent.as::FriendBarResizeEvent()
export class FriendBarResizeEvent
{
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/events/FriendBarResizeEvent.as::FRIENDBAR_RESIZE_EVENT
    public static readonly FRIENDBAR_RESIZE_EVENT: string = 'FBE_BAR_RESIZE_EVENT';

    // Derived name: `type` is declared in no AS3 tree — the trace points
    // at the class it belongs to, but the identifier itself is this port's.
    // AS3: sources/win63_version/habbo/friendbar/events/FriendBarResizeEvent.as::type
    public readonly type: string = FriendBarResizeEvent.FRIENDBAR_RESIZE_EVENT;
}
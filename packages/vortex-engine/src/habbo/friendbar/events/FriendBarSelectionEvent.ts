/**
 * A friend picked out of the friend bar, carrying who was picked.
 *
 * AS3's one consumer is `HabboCatalog`, which listens for it to fill in the recipient of a gift
 * purchase.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/events/FriendBarSelectionEvent.as
 */
export class FriendBarSelectionEvent
{
    // AS3: .../src/com/sulake/habbo/friendbar/events/FriendBarSelectionEvent.as::FRIEND_SELECTED
    public static readonly FRIEND_SELECTED: string = 'FBVE_FRIEND_SELECTED';

    // AS3: .../src/com/sulake/habbo/friendbar/events/FriendBarSelectionEvent.as::FriendBarSelectionEvent()
    constructor(private readonly _friendId: number, private readonly _friendName: string)
    {
    }

    /** AS3's constructor passes the type to `super()`; there is no Flash Event base here. */
    // AS3: .../src/com/sulake/habbo/friendbar/events/FriendBarSelectionEvent.as::FriendBarSelectionEvent()
    get type(): string
    {
        return FriendBarSelectionEvent.FRIEND_SELECTED;
    }

    // AS3: .../src/com/sulake/habbo/friendbar/events/FriendBarSelectionEvent.as::get friendId()
    get friendId(): number
    {
        return this._friendId;
    }

    // AS3: .../src/com/sulake/habbo/friendbar/events/FriendBarSelectionEvent.as::get friendName()
    get friendName(): string
    {
        return this._friendName;
    }
}

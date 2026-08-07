import {RoomWidgetUpdateEvent} from './RoomWidgetUpdateEvent';

/**
 * A friend request appearing over someone's head, or the same one going away.
 *
 * The hide variant carries only the request id: the two events it is built from
 * (`FRE_ACCEPTED`/`FRE_DECLINED`) know nothing else, and the widget only needs the key.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/events/RoomWidgetFriendRequestUpdateEvent.as
 */
export class RoomWidgetFriendRequestUpdateEvent extends RoomWidgetUpdateEvent
{
    // AS3: .../widget/events/RoomWidgetFriendRequestUpdateEvent.as::SHOW_FRIEND_REQUEST
    public static readonly SHOW_FRIEND_REQUEST: string = 'RWFRUE_SHOW_FRIEND_REQUEST';

    // AS3: .../widget/events/RoomWidgetFriendRequestUpdateEvent.as::HIDE_FRIEND_REQUEST
    public static readonly HIDE_FRIEND_REQUEST: string = 'RWFRUE_HIDE_FRIEND_REQUEST';

    // AS3: .../widget/events/RoomWidgetFriendRequestUpdateEvent.as::_requestId
    private _requestId: number;

    // AS3: .../widget/events/RoomWidgetFriendRequestUpdateEvent.as::_userId
    private _userId: number;

    // AS3: .../widget/events/RoomWidgetFriendRequestUpdateEvent.as::_userName
    private _userName: string | null;

    // AS3: .../widget/events/RoomWidgetFriendRequestUpdateEvent.as::RoomWidgetFriendRequestUpdateEvent()
    constructor(type: string, requestId: number, userId: number = 0, userName: string | null = null)
    {
        super(type);

        this._requestId = requestId;
        this._userId = userId;
        this._userName = userName;
    }

    // AS3: .../widget/events/RoomWidgetFriendRequestUpdateEvent.as::get requestId()
    get requestId(): number
    {
        return this._requestId;
    }

    // AS3: .../widget/events/RoomWidgetFriendRequestUpdateEvent.as::get userId()
    get userId(): number
    {
        return this._userId;
    }

    // AS3: .../widget/events/RoomWidgetFriendRequestUpdateEvent.as::get userName()
    get userName(): string | null
    {
        return this._userName;
    }
}

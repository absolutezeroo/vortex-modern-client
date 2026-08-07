import {RoomWidgetMessage} from './RoomWidgetMessage';

/**
 * Accepting or declining an in-room friend request. Both carry only the request id — the friend
 * list already knows who it came from.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/messages/RoomWidgetFriendRequestMessage.as
 */
export class RoomWidgetFriendRequestMessage extends RoomWidgetMessage
{
    // AS3: .../widget/messages/RoomWidgetFriendRequestMessage.as::ACCEPT
    public static readonly ACCEPT: string = 'RWFRM_ACCEPT';

    // AS3: .../widget/messages/RoomWidgetFriendRequestMessage.as::DECLINE
    public static readonly DECLINE: string = 'RWFRM_DECLINE';

    // AS3: .../widget/messages/RoomWidgetFriendRequestMessage.as::_requestId
    private _requestId: number;

    // AS3: .../widget/messages/RoomWidgetFriendRequestMessage.as::RoomWidgetFriendRequestMessage()
    constructor(type: string, requestId: number = 0)
    {
        super(type);

        this._requestId = requestId;
    }

    // AS3: .../widget/messages/RoomWidgetFriendRequestMessage.as::get requestId()
    get requestId(): number
    {
        return this._requestId;
    }
}

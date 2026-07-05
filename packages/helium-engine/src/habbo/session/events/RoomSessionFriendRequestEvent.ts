import type {IRoomSession} from '../IRoomSession';
import {RoomSessionEvent} from './RoomSessionEvent';

/**
 * Room session friend request event
 *
 * @see source_as_win63/habbo/session/events/RoomSessionFriendRequestEvent.as
 */
export class RoomSessionFriendRequestEvent extends RoomSessionEvent
{
    public static readonly FRIEND_REQUEST = 'RSFRE_FRIEND_REQUEST';

    constructor(session: IRoomSession, requestId: number, userId: number, userName: string, openLandingPage: boolean = false)
    {
        super(RoomSessionFriendRequestEvent.FRIEND_REQUEST, session, openLandingPage);
        this._requestId = requestId;
        this._userId = userId;
        this._userName = userName;
    }

    private _requestId: number;

    get requestId(): number
    {
        return this._requestId;
    }

    private _userId: number;

    get userId(): number
    {
        return this._userId;
    }

    private _userName: string;

    get userName(): string
    {
        return this._userName;
    }
}

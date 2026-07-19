import type {IRoomSession} from '../IRoomSession';
import {RoomSessionEvent} from './RoomSessionEvent';

/**
 * Room session user badges event
 *
 * Based on AS3: com.sulake.habbo.session.events.RoomSessionUserBadgesEvent
 */
export class RoomSessionUserBadgesEvent extends RoomSessionEvent
{
    public static readonly RSUBE_BADGES = 'RSUBE_BADGES';

    constructor(session: IRoomSession, userId: number, badges: string[])
    {
        super(RoomSessionUserBadgesEvent.RSUBE_BADGES, session);
        this._userId = userId;
        this._badges = badges;
    }

    private _userId: number;

    get userId(): number
    {
        return this._userId;
    }

    private _badges: string[];

    get badges(): string[]
    {
        return this._badges;
    }
}

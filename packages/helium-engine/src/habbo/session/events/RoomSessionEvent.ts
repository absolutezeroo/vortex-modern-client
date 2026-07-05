import type {IRoomSession} from '../IRoomSession';

/**
 * Room session event
 *
 * Based on AS3: com.sulake.habbo.session.events.RoomSessionEvent
 */
export class RoomSessionEvent
{
    public static readonly RSE_CREATED = 'RSE_CREATED';
    public static readonly RSE_STARTED = 'RSE_STARTED';
    public static readonly RSE_ENDED = 'RSE_ENDED';
    public static readonly SESSION_ROOM_DATA = 'RSE_ROOM_DATA';

    constructor(type: string, session: IRoomSession, openLandingPage: boolean = true)
    {
        this._type = type;
        this._session = session;
        this._openLandingPage = openLandingPage;
    }

    private _type: string;

    get type(): string
    {
        return this._type;
    }

    private _session: IRoomSession;

    get session(): IRoomSession
    {
        return this._session;
    }

    private _openLandingPage: boolean;

    get openLandingPage(): boolean
    {
        return this._openLandingPage;
    }
}

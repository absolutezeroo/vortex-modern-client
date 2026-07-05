import type {IRoomSession} from '../IRoomSession';
import {RoomSessionEvent} from './RoomSessionEvent';

/**
 * Room session property update event
 *
 * Based on AS3: com.sulake.habbo.session.events.RoomSessionPropertyUpdateEvent
 */
export class RoomSessionPropertyUpdateEvent extends RoomSessionEvent
{
    public static readonly RSDUE_ALLOW_PETS = 'RSDUE_ALLOW_PETS';
    public static readonly RSDUE_SETTINGS = 'RSDUE_SETTINGS';

    constructor(type: string, session: IRoomSession)
    {
        super(type, session);
    }
}

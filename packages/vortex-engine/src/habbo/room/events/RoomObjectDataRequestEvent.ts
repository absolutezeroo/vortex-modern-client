/**
 * RoomObjectDataRequestEvent
 *
 * @see source_as_win63/habbo/room/events/RoomObjectDataRequestEvent.as
 *
 * Event dispatched to request data for a room object (current user ID, URL prefix).
 */
import {RoomObjectEvent} from '@room/events/RoomObjectEvent';
import type {IRoomObject} from '@room/object/IRoomObject';

export class RoomObjectDataRequestEvent extends RoomObjectEvent
{
    public static readonly CURRENT_USER_ID = 'RODRE_CURRENT_USER_ID';
    public static readonly URL_PREFIX = 'RODRE_URL_PREFIX';

    constructor(type: string, object: IRoomObject)
    {
        super(type, object);
    }
}

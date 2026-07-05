/**
 * RoomObjectFloorHoleEvent
 *
 * @see source_as_win63/habbo/room/events/RoomObjectFloorHoleEvent.as
 *
 * Event dispatched when floor holes are added or removed (e.g. for roller holes).
 */
import {RoomObjectEvent} from '@room/events/RoomObjectEvent';
import type {IRoomObject} from '@room/object/IRoomObject';

export class RoomObjectFloorHoleEvent extends RoomObjectEvent
{
    public static readonly ADD_HOLE = 'ROFHO_ADD_HOLE';
    public static readonly REMOVE_HOLE = 'ROFHO_REMOVE_HOLE';

    constructor(type: string, object: IRoomObject)
    {
        super(type, object);
    }
}

/**
 * RoomObjectStateChangeEvent
 *
 * @see source_as_win63/habbo/room/events/RoomObjectStateChangeEvent.as
 *
 * Event dispatched when a room object changes state.
 */
import {RoomObjectEvent} from '@room/events/RoomObjectEvent';
import type {IRoomObject} from '@room/object/IRoomObject';

export class RoomObjectStateChangeEvent extends RoomObjectEvent
{
    public static readonly ROSCE_STATE_CHANGE = 'ROSCE_STATE_CHANGE';
    public static readonly ROSCE_STATE_RANDOM = 'ROSCE_STATE_RANDOM';

    constructor(type: string, object: IRoomObject | null, param: number = 0)
    {
        super(type, object);
        this._param = param;
    }

    private _param: number = 0;

    get param(): number
    {
        return this._param;
    }
}

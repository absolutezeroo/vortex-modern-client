/**
 * RoomObjectDimmerStateUpdateEvent
 *
 * @see source_as_win63/habbo/room/events/RoomObjectDimmerStateUpdateEvent.as
 *
 * Event dispatched from room object when dimmer state is updated.
 */
import {RoomObjectEvent} from '@room/events/RoomObjectEvent';
import type {IRoomObject} from '@room/object/IRoomObject';

export class RoomObjectDimmerStateUpdateEvent extends RoomObjectEvent
{
    public static readonly CYCLED = 'RODSUE_DIMMER_STATE';

    constructor(
        object: IRoomObject,
        state: number,
        presetId: number,
        effectId: number,
        color: number,
        brightness: number
    )
    {
        super(RoomObjectDimmerStateUpdateEvent.CYCLED, object);
        this._state = state;
        this._presetId = presetId;
        this._effectId = effectId;
        this._color = color;
        this._brightness = brightness;
    }

    private _state: number;

    get state(): number
    {
        return this._state;
    }

    private _presetId: number;

    get presetId(): number
    {
        return this._presetId;
    }

    private _effectId: number;

    get effectId(): number
    {
        return this._effectId;
    }

    private _color: number;

    get color(): number
    {
        return this._color;
    }

    private _brightness: number;

    get brightness(): number
    {
        return this._brightness;
    }
}

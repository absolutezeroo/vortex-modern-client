/**
 * RoomEngineDimmerStateEvent
 *
 * @see source_as_win63/habbo/room/events/RoomEngineDimmerStateEvent.as
 *
 * Event dispatched when dimmer state changes in a room.
 */
import {RoomEngineEvent} from './RoomEngineEvent';

export class RoomEngineDimmerStateEvent extends RoomEngineEvent
{
    public static readonly CYCLED = 'REDSE_ROOM_COLOR';

    constructor(
        roomId: number,
        objectId: number,
        state: number,
        presetId: number,
        effectId: number,
        color: number,
        brightness: number
    )
    {
        super(RoomEngineDimmerStateEvent.CYCLED, roomId);
        this._objectId = objectId;
        this._state = state;
        this._presetId = presetId;
        this._effectId = effectId;
        this._color = color;
        this._brightness = brightness;
    }

    private _objectId: number;

    get objectId(): number
    {
        return this._objectId;
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

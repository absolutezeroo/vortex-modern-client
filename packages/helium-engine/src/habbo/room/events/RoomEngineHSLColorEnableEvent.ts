/**
 * RoomEngineHSLColorEnableEvent
 *
 * @see source_as_win63/habbo/room/events/RoomEngineHSLColorEnableEvent.as
 *
 * Event dispatched when HSL room background color is enabled/changed.
 */
import {RoomEngineEvent} from './RoomEngineEvent';

export class RoomEngineHSLColorEnableEvent extends RoomEngineEvent
{
    public static readonly ROOM_BACKGROUND_COLOR = 'ROHSLCEE_ROOM_BACKGROUND_COLOR';

    constructor(
        type: string,
        roomId: number,
        enable: boolean,
        hue: number,
        saturation: number,
        lightness: number
    )
    {
        super(type, roomId);
        this._enable = enable;
        this._hue = hue;
        this._saturation = saturation;
        this._lightness = lightness;
    }

    private _enable: boolean;

    get enable(): boolean
    {
        return this._enable;
    }

    private _hue: number;

    get hue(): number
    {
        return this._hue;
    }

    private _saturation: number;

    get saturation(): number
    {
        return this._saturation;
    }

    private _lightness: number;

    get lightness(): number
    {
        return this._lightness;
    }
}

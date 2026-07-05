/**
 * Dimmer preset item
 *
 * @see source_as_win63/habbo/session/events/RoomSessionDimmerPresetsEventPresetItem.as
 */
export class RoomSessionDimmerPresetsEventPresetItem
{
    constructor(id: number, type: number, color: number, light: number)
    {
        this._id = id;
        this._type = type;
        this._color = color;
        this._light = light;
    }

    private _id: number;

    get id(): number
    {
        return this._id;
    }

    private _type: number;

    get type(): number
    {
        return this._type;
    }

    private _color: number;

    get color(): number
    {
        return this._color;
    }

    private _light: number;

    get light(): number
    {
        return this._light;
    }
}

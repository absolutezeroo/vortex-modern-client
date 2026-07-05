/**
 * RoomObjectRoomColorUpdateMessage
 *
 * @see source_as_win63/habbo/room/messages/RoomObjectRoomColorUpdateMessage.as
 *
 * Update message for room background color changes.
 */
import {RoomObjectUpdateMessage} from '@room/messages/RoomObjectUpdateMessage';

export class RoomObjectRoomColorUpdateMessage extends RoomObjectUpdateMessage
{
    public static readonly BACKGROUND_COLOR = 'RORCUM_BACKGROUND_COLOR';

    constructor(type: string, color: number, light: number, bgOnly: boolean)
    {
        super(null, null);
        this._type = type;
        this._color = color;
        this._light = light;
        this._bgOnly = bgOnly;
    }

    private _type: string = '';

    get type(): string
    {
        return this._type;
    }

    private _color: number = 0;

    get color(): number
    {
        return this._color;
    }

    private _light: number = 0;

    get light(): number
    {
        return this._light;
    }

    private _bgOnly: boolean = true;

    get bgOnly(): boolean
    {
        return this._bgOnly;
    }
}

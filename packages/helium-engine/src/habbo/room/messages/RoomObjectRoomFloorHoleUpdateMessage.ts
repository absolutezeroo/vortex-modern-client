/**
 * RoomObjectRoomFloorHoleUpdateMessage
 *
 * @see source_as_win63/habbo/room/messages/RoomObjectRoomFloorHoleUpdateMessage.as
 *
 * Update message for floor hole additions and removals.
 */
import {RoomObjectUpdateMessage} from '@room/messages/RoomObjectUpdateMessage';

export class RoomObjectRoomFloorHoleUpdateMessage extends RoomObjectUpdateMessage
{
    public static readonly ADD_HOLE = 'RORPFHUM_ADD';
    public static readonly REMOVE_HOLE = 'RORPFHUM_REMOVE';

    constructor(
        type: string,
        id: number,
        x: number = 0,
        y: number = 0,
        width: number = 0,
        height: number = 0,
        invert: boolean = false
    )
    {
        super(null, null);
        this._type = type;
        this._id = id;
        this._x = x;
        this._y = y;
        this._width = width;
        this._height = height;
        this._invert = invert;
    }

    private _type: string = '';

    get type(): string
    {
        return this._type;
    }

    private _id: number;

    get id(): number
    {
        return this._id;
    }

    private _x: number;

    get x(): number
    {
        return this._x;
    }

    private _y: number;

    get y(): number
    {
        return this._y;
    }

    private _width: number;

    get width(): number
    {
        return this._width;
    }

    private _height: number;

    get height(): number
    {
        return this._height;
    }

    private _invert: boolean;

    get invert(): boolean
    {
        return this._invert;
    }
}

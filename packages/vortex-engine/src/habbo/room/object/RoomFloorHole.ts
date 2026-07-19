/**
 * RoomFloorHole
 *
 * Based on AS3: com.sulake.habbo.room.object.RoomFloorHole
 */
export class RoomFloorHole
{
    constructor(x: number, y: number, width: number, height: number)
    {
        this._x = x;
        this._y = y;
        this._width = width;
        this._height = height;
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
}

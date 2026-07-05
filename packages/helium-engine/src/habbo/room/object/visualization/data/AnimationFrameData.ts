/**
 * AnimationFrameData
 *
 * @see com.sulake.habbo.room.object.visualization.data.AnimationFrameData
 *
 * Static frame data definition: id, x, y, randomX, randomY, repeats.
 */
export class AnimationFrameData
{
    constructor(id: number, x: number, y: number, randomX: number, randomY: number, repeats: number)
    {
        this._id = id;
        this._x = x;
        this._y = y;
        this._randomX = randomX;
        this._randomY = randomY;
        this._repeats = repeats;
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

    private _randomX: number;

    get randomX(): number
    {
        return this._randomX;
    }

    private _randomY: number;

    get randomY(): number
    {
        return this._randomY;
    }

    private _repeats: number;

    get repeats(): number
    {
        return this._repeats;
    }

    hasDirectionalOffsets(): boolean
    {
        return false;
    }

    getX(_direction: number): number
    {
        return this._x;
    }

    getY(_direction: number): number
    {
        return this._y;
    }
}

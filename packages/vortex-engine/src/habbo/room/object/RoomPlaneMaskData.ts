/**
 * RoomPlaneMaskData
 *
 * Based on AS3: com.sulake.habbo.room.object.RoomPlaneMaskData
 */
export class RoomPlaneMaskData
{
    constructor(leftSideLoc: number, rightSideLoc: number, leftSideLength: number, rightSideLength: number)
    {
        this._leftSideLoc = leftSideLoc;
        this._rightSideLoc = rightSideLoc;
        this._leftSideLength = leftSideLength;
        this._rightSideLength = rightSideLength;
    }

    private _leftSideLoc: number;

    get leftSideLoc(): number
    {
        return this._leftSideLoc;
    }

    private _rightSideLoc: number;

    get rightSideLoc(): number
    {
        return this._rightSideLoc;
    }

    private _leftSideLength: number;

    get leftSideLength(): number
    {
        return this._leftSideLength;
    }

    private _rightSideLength: number;

    get rightSideLength(): number
    {
        return this._rightSideLength;
    }
}

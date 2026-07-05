/**
 * RoomPlaneBitmapMask
 *
 * @see com.sulake.habbo.room.object.visualization.room.RoomPlaneBitmapMask
 *
 * Simple data object storing bitmap mask type and left/right side locations.
 */
export class RoomPlaneBitmapMask
{
    constructor(type: string, leftSideLoc: number, rightSideLoc: number)
    {
        this._type = type;
        this._leftSideLoc = leftSideLoc;
        this._rightSideLoc = rightSideLoc;
    }

    private _type: string;

    get type(): string
    {
        return this._type;
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
}

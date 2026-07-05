/**
 * DirectionalOffsetData
 *
 * @see com.sulake.habbo.room.object.visualization.data.class_3534
 *
 * Offsets x/y per direction for animation frames.
 */
export class DirectionalOffsetData
{
    private _offsetX: Map<number, number> = new Map();
    private _offsetY: Map<number, number> = new Map();

    getOffsetX(direction: number, defaultValue: number): number
    {
        const value = this._offsetX.get(direction);

        if(value === undefined)
        {
            return defaultValue;
        }

        return value;
    }

    getOffsetY(direction: number, defaultValue: number): number
    {
        const value = this._offsetY.get(direction);

        if(value === undefined)
        {
            return defaultValue;
        }

        return value;
    }

    setOffset(direction: number, x: number, y: number): void
    {
        this._offsetX.set(direction, x);
        this._offsetY.set(direction, y);
    }
}

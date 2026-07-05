/**
 * RoomPlaneBitmapMaskData
 *
 * @see source_as_win63/habbo/room/object/RoomPlaneBitmapMaskData.as
 *
 * Data container for a bitmap mask applied to a room plane (door, window).
 */
import type {IVector3d} from '@room/utils/IVector3d';
import {Vector3d} from '@room/utils/Vector3d';

export class RoomPlaneBitmapMaskData
{
    public static readonly MASK_CATEGORY_WINDOW = 'window';
    public static readonly MASK_CATEGORY_HOLE = 'hole';

    constructor(type: string, location: IVector3d, category: string)
    {
        this._type = type;
        this._category = category;
        this._loc = new Vector3d();
        this._loc.assign(location);
    }

    private _type: string;

    get type(): string
    {
        return this._type;
    }

    set type(value: string)
    {
        this._type = value;
    }

    private _loc: Vector3d | null = null;

    get loc(): IVector3d | null
    {
        return this._loc;
    }

    set loc(value: IVector3d)
    {
        if(this._loc === null)
        {
            this._loc = new Vector3d();
        }
        this._loc.assign(value);
    }

    private _category: string;

    get category(): string
    {
        return this._category;
    }

    set category(value: string)
    {
        this._category = value;
    }

    dispose(): void
    {
        this._loc = null;
    }
}

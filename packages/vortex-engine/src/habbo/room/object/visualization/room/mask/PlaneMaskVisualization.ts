/**
 * PlaneMaskVisualization
 *
 * @see com.sulake.habbo.room.object.visualization.room.mask.PlaneMaskVisualization
 *
 * Container of PlaneMaskBitmaps. Finds applicable asset by normalized position.
 */
import type {IGraphicAsset} from '@room/object/visualization/utils/IGraphicAsset';
import type {IVector3d} from '@room/utils/IVector3d';
import {PlaneMaskBitmap} from './PlaneMaskBitmap';

export class PlaneMaskVisualization
{
    private _bitmaps: PlaneMaskBitmap[] = [];

    dispose(): void
    {
        for(const bitmap of this._bitmaps)
        {
            bitmap.dispose();
        }

        this._bitmaps = [];
    }

    addBitmap(
        asset: IGraphicAsset,
        normalMinX: number = -1,
        normalMaxX: number = 1,
        normalMinY: number = -1,
        normalMaxY: number = 1
    ): void
    {
        this._bitmaps.push(new PlaneMaskBitmap(asset, normalMinX, normalMaxX, normalMinY, normalMaxY));
    }

    getAsset(position: IVector3d): IGraphicAsset | null
    {
        if(position === null)
        {
            return null;
        }

        for(const bitmap of this._bitmaps)
        {
            if(position.x >= bitmap.normalMinX && position.x <= bitmap.normalMaxX &&
				position.y >= bitmap.normalMinY && position.y <= bitmap.normalMaxY)
            {
                return bitmap.asset;
            }
        }

        return null;
    }
}

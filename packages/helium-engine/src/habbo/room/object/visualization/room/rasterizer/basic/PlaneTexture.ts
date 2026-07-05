/**
 * PlaneTexture
 *
 * Based on AS3: com.sulake.habbo.room.object.visualization.room.rasterizer.basic.PlaneTexture
 *
 * Collection of PlaneTextureBitmaps, selects appropriate bitmap by normal vector.
 */
import type {IVector3d} from '@room/utils/IVector3d';
import {PlaneTextureBitmap} from './PlaneTextureBitmap';

export class PlaneTexture
{
    private _bitmaps: PlaneTextureBitmap[] = [];

    dispose(): void
    {
        if(this._bitmaps !== null)
        {
            for(const bitmap of this._bitmaps)
            {
                if(bitmap !== null)
                {
                    bitmap.dispose();
                }
            }
            this._bitmaps = [];
        }
    }

    addBitmap(
        bitmap: HTMLCanvasElement,
        normalMinX: number = -1,
        normalMaxX: number = 1,
        normalMinY: number = -1,
        normalMaxY: number = 1,
        assetName: string | null = null
    ): void
    {
        const textureBitmap = new PlaneTextureBitmap(bitmap, normalMinX, normalMaxX, normalMinY, normalMaxY, assetName);
        this._bitmaps.push(textureBitmap);
    }

    getBitmap(normal: IVector3d): HTMLCanvasElement | null
    {
        const textureBitmap = this.getPlaneTextureBitmap(normal);
        return textureBitmap === null ? null : textureBitmap.bitmap;
    }

    getPlaneTextureBitmap(normal: IVector3d): PlaneTextureBitmap | null
    {
        if(normal === null)
        {
            return null;
        }

        for(const bitmap of this._bitmaps)
        {
            if(bitmap !== null)
            {
                if(normal.x >= bitmap.normalMinX &&
					normal.x <= bitmap.normalMaxX &&
					normal.y >= bitmap.normalMinY &&
					normal.y <= bitmap.normalMaxY)
                {
                    return bitmap;
                }
            }
        }

        return null;
    }

    getAssetName(normal: IVector3d): string | null
    {
        const bitmap = this.getPlaneTextureBitmap(normal);
        return bitmap === null ? null : bitmap.assetName;
    }
}

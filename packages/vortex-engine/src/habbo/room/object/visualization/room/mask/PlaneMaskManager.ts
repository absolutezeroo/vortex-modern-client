/**
 * PlaneMaskManager
 *
 * @see com.sulake.habbo.room.object.visualization.room.mask.PlaneMaskManager
 *
 * Parses mask configuration (JSON adapted from XML), creates PlaneMask objects,
 * and applies mask bitmaps to plane drawing.
 */
import type {IGraphicAssetCollection} from '@room/object/visualization/utils/IGraphicAssetCollection';
import type {IVector3d} from '@room/utils/IVector3d';
import {PlaneMask} from './PlaneMask';

export class PlaneMaskManager
{
    private _assetCollection: IGraphicAssetCollection | null = null;
    private _masks: Map<string, PlaneMask> = new Map();
    private _data: any = null;

    get data(): any
    {
        return this._data;
    }

    dispose(): void
    {
        this._assetCollection = null;
        this._data = null;

        for(const mask of this._masks.values())
        {
            mask.dispose();
        }

        this._masks.clear();
    }

    initialize(data: any): void
    {
        this._data = data;
    }

    initializeAssetCollection(collection: IGraphicAssetCollection): void
    {
        if(this._data === null)
        {
            return;
        }

        this._assetCollection = collection;
        this.parseMasks(this._data, collection);
    }

    updateMask(
        _target: any,
        maskType: string,
        scale: number,
        position: IVector3d,
        _offsetX: number,
        _offsetY: number
    ): boolean
    {
        const mask = this._masks.get(maskType);

        if(mask !== undefined)
        {
            const asset = mask.getGraphicAsset(scale, position);

            if(asset !== null && asset.texture !== null)
            {
                // In PixiJS, mask application is handled by the rendering pipeline
                // rather than drawing onto BitmapData. The mask asset is available for use.
                return true;
            }
        }

        return true;
    }

    getMask(name: string): PlaneMask | null
    {
        return this._masks.get(name) || null;
    }

    private parseMasks(data: any, collection: IGraphicAssetCollection): void
    {
        if(data === null || collection === null)
        {
            return;
        }

        const masks = data.mask || data.masks;

        if(!Array.isArray(masks))
        {
            return;
        }

        for(const maskData of masks)
        {
            const id = maskData.id;

            if(id === undefined || this._masks.has(id))
            {
                continue;
            }

            const planeMask = new PlaneMask();
            const visualizations = maskData.visualizations || maskData.maskVisualization || [];

            if(Array.isArray(visualizations))
            {
                for(const vizData of visualizations)
                {
                    const size = parseInt(vizData.size);

                    if(isNaN(size))
                    {
                        continue;
                    }

                    const maskViz = planeMask.createMaskVisualization(size);

                    if(maskViz !== null)
                    {
                        const bitmaps = vizData.bitmaps || vizData.bitmap || [];
                        let assetName: string | null = null;

                        if(Array.isArray(bitmaps))
                        {
                            for(const bmpData of bitmaps)
                            {
                                const name = bmpData.assetName;

                                if(name === undefined)
                                {
                                    continue;
                                }

                                const normalMinX = parseFloat(bmpData.normalMinX) || -1;
                                const normalMaxX = parseFloat(bmpData.normalMaxX) || 1;
                                const normalMinY = parseFloat(bmpData.normalMinY) || -1;
                                const normalMaxY = parseFloat(bmpData.normalMaxY) || 1;

                                const gAsset = collection.getAsset(name);

                                if(gAsset !== null)
                                {
                                    if(!gAsset.flipH)
                                    {
                                        assetName = name;
                                    }

                                    maskViz.addBitmap(gAsset, normalMinX, normalMaxX, normalMinY, normalMaxY);
                                }
                            }
                        }

                        if(assetName !== null)
                        {
                            planeMask.setAssetName(size, assetName);
                        }
                    }
                }
            }

            this._masks.set(id, planeMask);
        }
    }
}

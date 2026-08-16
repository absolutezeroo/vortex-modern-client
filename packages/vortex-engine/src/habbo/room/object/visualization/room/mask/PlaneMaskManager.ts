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
    /**
     * AS3's `if(String(@attr) != "") value = parseFloat(@attr)` — the default stands in only for a
     * missing attribute, never for a present `0`.
     */
    // TS-only: AS3 inlines this test four times; extracted so the four cannot drift apart.
    private static readNormal(raw: unknown, fallback: number): number
    {
        if(raw === null || raw === undefined || raw === '') return fallback;

        const value = parseFloat(raw as string);

        return isNaN(value) ? fallback : value;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/room/object/visualization/room/mask/PlaneMaskManager.as::_assetCollection
    private _assetCollection: IGraphicAssetCollection | null = null;
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/room/object/visualization/room/mask/PlaneMaskManager.as::_masks
    private _masks: Map<string, PlaneMask> = new Map();
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/room/object/visualization/room/mask/PlaneMaskManager.as::_data
    private _data: any = null;

    // AS3: .../src/com/sulake/habbo/room/object/visualization/room/mask/PlaneMaskManager.as::get data()
    get data(): any
    {
        return this._data;
    }

    // AS3: .../src/com/sulake/habbo/room/object/visualization/room/mask/PlaneMaskManager.as::dispose()
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

    // AS3: .../src/com/sulake/habbo/room/object/visualization/room/mask/PlaneMaskManager.as::initialize()
    initialize(data: any): void
    {
        this._data = data;
    }

    // AS3: .../src/com/sulake/habbo/room/object/visualization/room/mask/PlaneMaskManager.as::initializeAssetCollection()
    initializeAssetCollection(collection: IGraphicAssetCollection): void
    {
        if(this._data === null)
        {
            return;
        }

        this._assetCollection = collection;
        this.parseMasks(this._data, collection);
    }

    // AS3: .../src/com/sulake/habbo/room/object/visualization/room/mask/PlaneMaskManager.as::updateMask()
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

    // AS3: .../src/com/sulake/habbo/room/object/visualization/room/mask/PlaneMaskManager.as::getMask()
    getMask(name: string): PlaneMask | null
    {
        return this._masks.get(name) || null;
    }

    // AS3: .../src/com/sulake/habbo/room/object/visualization/room/mask/PlaneMaskManager.as::parseMasks()
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

                                // Same absent-vs-zero distinction as AnimationData's loopCount: AS3
                                // falls back to MIN/MAX_NORMAL_COORDINATE_VALUE (-1/1) only when
                                // the attribute is absent (`if(String(@normalMinX) != "")`), and a
                                // normal coordinate of exactly 0 is a legitimate bound. `|| -1`
                                // silently widened the range to the whole hemisphere, so the mask
                                // matched planes it should not have.
                                const normalMinX = PlaneMaskManager.readNormal(bmpData.normalMinX, -1);
                                const normalMaxX = PlaneMaskManager.readNormal(bmpData.normalMaxX, 1);
                                const normalMinY = PlaneMaskManager.readNormal(bmpData.normalMinY, -1);
                                const normalMaxY = PlaneMaskManager.readNormal(bmpData.normalMaxY, 1);

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

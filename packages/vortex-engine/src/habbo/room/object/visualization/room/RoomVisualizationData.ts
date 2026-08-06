/**
 * RoomVisualizationData
 *
 * Based on AS3: com.sulake.habbo.room.object.visualization.room.RoomVisualizationData
 *
 * Manages all rasterizers (floor, wall) and initializes them from bundle data.
 */
import type {IRoomObjectVisualizationData} from '@room/object/visualization/IRoomObjectVisualizationData';
import type {IPlaneRasterizer} from './rasterizer/IPlaneRasterizer';
import {FloorRasterizer} from './rasterizer/basic/FloorRasterizer';
import {WallRasterizer} from './rasterizer/basic/WallRasterizer';
import type {IAssetRoomVisualizationData} from './rasterizer/basic/PlaneRasterizerTypes';

export class RoomVisualizationData implements IRoomObjectVisualizationData
{
    constructor()
    {
        this._floorRasterizer = new FloorRasterizer();
        this._wallRasterizer = new WallRasterizer();
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/room/object/visualization/room/RoomVisualizationData.as::_floorRasterizer
    private _floorRasterizer: FloorRasterizer;

    // AS3: .../src/com/sulake/habbo/room/object/visualization/room/RoomVisualizationData.as::get floorRasterizer()
    get floorRasterizer(): IPlaneRasterizer
    {
        return this._floorRasterizer;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/room/object/visualization/room/RoomVisualizationData.as::_wallRasterizer
    private _wallRasterizer: WallRasterizer;

    // AS3: .../src/com/sulake/habbo/room/object/visualization/room/RoomVisualizationData.as::get wallRasterizer()
    get wallRasterizer(): IPlaneRasterizer
    {
        return this._wallRasterizer;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/room/object/visualization/room/RoomVisualizationData.as::_initialized
    private _initialized: boolean = false;

    // AS3: .../src/com/sulake/habbo/room/object/visualization/room/RoomVisualizationData.as::get initialized()
    get initialized(): boolean
    {
        return this._initialized;
    }

    private _disposed: boolean = false;

    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: .../src/com/sulake/habbo/room/object/visualization/room/RoomVisualizationData.as::initialize()
    initialize(data: unknown): boolean
    {
        this.reset();

        if(data === null || data === undefined) return false;

        const vizData = data as IAssetRoomVisualizationData;

        if(vizData.floorData)
        {
            this._floorRasterizer.initialize(vizData.floorData);
        }

        if(vizData.wallData)
        {
            this._wallRasterizer.initialize(vizData.wallData);
        }

        return true;
    }

    // AS3: .../src/com/sulake/habbo/room/object/visualization/room/RoomVisualizationData.as::initializeAssetCollection()
    initializeAssetCollection(textures: Map<string, HTMLCanvasElement>): void
    {
        if(this._initialized) return;

        this._floorRasterizer.initializeAssetCollection(textures);
        this._wallRasterizer.initializeAssetCollection(textures);

        this._initialized = true;
    }

    // AS3: .../src/com/sulake/habbo/room/object/visualization/room/RoomVisualizationData.as::clearCache()
    clearCache(): void
    {
        this._floorRasterizer.clearCache();
        this._wallRasterizer.clearCache();
    }

    // AS3: .../src/com/sulake/habbo/room/object/visualization/room/RoomVisualizationData.as::dispose()
    dispose(): void
    {
        if(this._disposed) return;
        this._floorRasterizer.dispose();
        this._wallRasterizer.dispose();
        this._disposed = true;
    }

    // AS3: .../src/com/sulake/habbo/room/object/visualization/room/RoomVisualizationData.as::reset()
    protected reset(): void
    {
        // Override in subclasses if needed
    }
}

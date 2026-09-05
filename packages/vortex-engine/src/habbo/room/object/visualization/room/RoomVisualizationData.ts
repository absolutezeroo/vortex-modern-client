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
import {PlaneMaskManager} from './mask/PlaneMaskManager';
import type {IGraphicAssetCollection} from '@room/object/visualization/utils/IGraphicAssetCollection';

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

    /**
     * The door and window artwork, shared by every plane in the room.
     *
     * One per room rather than one per plane: the masks are keyed by type, not by wall, and a
     * hundred planes asking the same twenty assets for the same twenty shapes would each build
     * their own copy of the table.
     */
    // AS3: .../src/com/sulake/habbo/room/object/visualization/room/RoomVisualizationData.as::_maskManager
    // Name DERIVED: AS3's field is `_SafeStr_6110`, obfuscated; named after its getter below.
    private _maskManager: PlaneMaskManager = new PlaneMaskManager();

    // AS3: .../src/com/sulake/habbo/room/object/visualization/room/RoomVisualizationData.as::get maskManager()
    get maskManager(): PlaneMaskManager
    {
        return this._maskManager;
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

        // AS3 reads `maskData` out of the same bundle right after the rasterizers (l.148-153) and
        // hands it to the mask manager. Without this the manager holds no masks at all, so every
        // `updateMask()` resolves nothing and every door and window silently keeps the geometric
        // approximation.
        if(vizData.maskData)
        {
            this._maskManager.initialize(vizData.maskData);
        }

        return true;
    }

    /**
     * Hands the room's artwork to everything that draws with it.
     *
     * Two forms, because two consumers want different things and AS3 only ever had one. The
     * rasterizers take textures by name as canvases — that is all a plane's material needs. The
     * mask manager takes a real `IGraphicAssetCollection`, because a mask has to be positioned:
     * `updateMask()` reads each asset's **offset and flip flags**, and a bare texture carries
     * neither. Handing it the canvas map would draw every mask at the plane's origin instead of at
     * the opening.
     *
     * The collection is optional: a caller that has not built one still gets working rasterizers,
     * and the masks simply resolve nothing — which is where this port was before 2026-09-05.
     */
    // AS3: .../src/com/sulake/habbo/room/object/visualization/room/RoomVisualizationData.as::initializeAssetCollection()
    initializeAssetCollection(
        textures: Map<string, HTMLCanvasElement>,
        collection: IGraphicAssetCollection | null = null
    ): void
    {
        if(this._initialized) return;

        this._floorRasterizer.initializeAssetCollection(textures);
        this._wallRasterizer.initializeAssetCollection(textures);

        // AS3 forwards to the mask manager here too (l.167).
        if(collection !== null) this._maskManager.initializeAssetCollection(collection);

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
        // AS3 disposes it here too (l.89-92).
        this._maskManager.dispose();
        this._disposed = true;
    }

    // AS3: .../src/com/sulake/habbo/room/object/visualization/room/RoomVisualizationData.as::reset()
    protected reset(): void
    {
        // Override in subclasses if needed
    }
}

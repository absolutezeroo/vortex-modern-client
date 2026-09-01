import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {IRoomObjectVisualizationData} from '@room/object/visualization/IRoomObjectVisualizationData';

/**
 * The visualization data both snow-war room objects share, and it holds exactly one thing: an asset
 * library.
 *
 * There is no XML to parse — `initialize()` returns true without looking at its argument — because
 * a snowball and its splash are fixed bitmaps named in code, not a furniture visualization with
 * layers and directions. `RoomObjectVisualizationFactory` pushes the library in after building it,
 * and the two visualizations read their frames straight out of it.
 *
 * **The name is recovered, not derived**: `_SafeCls_2245` in the primary tree, `class_2115` in
 * `win63_version`, and `GameObjectVisualization` in the unobfuscated 2016 build — same four
 * members, same package.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/object/visualization/furniture/_SafeCls_2245.as
 * @see sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/room/object/visualization/furniture/GameObjectVisualization.as
 */
export class GameObjectVisualization implements IRoomObjectVisualizationData
{
    // AS3: _SafeCls_2245.as::_assets
    private _assets: IAssetLibrary | null = null;

    // TS-only: this port's `IDisposable` declares `disposed`; AS3's `IRoomObjectVisualizationData`
    // has only `dispose()`, so the flag has no counterpart to trace.
    private _disposed: boolean = false;

    // TS-only: see `_disposed`.
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: _SafeCls_2245.as::get assets()
    get assets(): IAssetLibrary | null
    {
        return this._assets;
    }

    // AS3: _SafeCls_2245.as::set assets()
    set assets(assets: IAssetLibrary | null)
    {
        this._assets = assets;
    }

    /** Takes no data: there is nothing in the XML for a snowball. */
    // AS3: _SafeCls_2245.as::initialize()
    initialize(_data: unknown): boolean
    {
        return true;
    }

    // AS3: _SafeCls_2245.as::dispose()
    dispose(): void
    {
        this._assets = null;
        this._disposed = true;
    }
}

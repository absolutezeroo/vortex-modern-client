import type {IVector3d} from '@room/utils/IVector3d';

/**
 * A room plane as everything outside the visualisation sees it: an id, a corner and two sides, and
 * the colour it is tinted with. `RoomPlane` is the implementation.
 *
 * DEVIATION: AS3's interface has a sixth member, `getDrawingDatas(geometry):Array`, and it is left
 *   out here for the same reason `RoomPlane` does not implement it — this port's rasterizer paints
 *   straight to a canvas rather than returning asset-name columns for an external compositor to
 *   assemble. `SpriteDataCollector.getRoomPlanes()` (AS3's `_SafeCls_1840`, the one caller) builds
 *   one `PlaneDrawingData` per plane from the geometry instead, and both deviations are argued at
 *   their own declarations. Adding the member here would make the interface unimplementable by the
 *   only class that implements it.
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/room/object/visualization/IRoomPlane.as
 */
export interface IRoomPlane
{
    // AS3: .../src/com/sulake/room/object/visualization/IRoomPlane.as::get uniqueId()
    readonly uniqueId: number;

    // AS3: .../src/com/sulake/room/object/visualization/IRoomPlane.as::get location()
    readonly location: IVector3d;

    // AS3: .../src/com/sulake/room/object/visualization/IRoomPlane.as::get leftSide()
    readonly leftSide: IVector3d;

    // AS3: .../src/com/sulake/room/object/visualization/IRoomPlane.as::get rightSide()
    readonly rightSide: IVector3d;

    // AS3: .../src/com/sulake/room/object/visualization/IRoomPlane.as::get color()
    readonly color: number;
}

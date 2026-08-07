/**
 * Room lighting — occluder extraction.
 *
 * NOT A PORT. See LightingConfig.ts's header for why this whole directory has no AS3 counterpart.
 *
 * The shadow casters are read off the furniture stacking height map rather than off the furniture
 * objects themselves. That map is already maintained by RoomEngine as items are placed, moved and
 * picked up, and it answers the only two questions this layer asks:
 *
 *   - `getIsRoomTile(x, y)` — is there floor here? Everything that is not floor (walls, the void
 *     outside the room) is solid, and therefore an occluder.
 *   - `getTileHeight(x, y)` — how tall is the furniture stack here? Above `minCasterHeight` the
 *     tile blocks light.
 *
 * Reading the map instead of the object list means no per-furniture footprint maths, no rotation
 * handling, and no subscription to object add/move/remove: a signature over the grid tells us when
 * anything changed.
 *
 * **Tile (x, y) is CENTRED on world (x, y)** — it spans [x - 0.5, x + 0.5] in both axes, not
 * [x, x + 1]. That is not a choice; it is how the floor is actually rasterised, from
 * `RoomPlaneParser`:
 *
 *     const planeX = x / 4 - 0.5;   // x is in quarter-tiles, so x / 4 is the tile index
 *     const planeY = y / 4 - 0.5;
 *
 * Grid coordinates from this module — segment endpoints, floor-run edges — are therefore tile
 * indices and must go through `gridToWorld()` before being projected. Object locations are already
 * world coordinates and must not. Getting this wrong offsets everything by half a tile, which on
 * screen is 16 pixels straight down: small enough to look like a rounding artefact and large enough
 * to be obviously wrong once seen.
 */
import type {FurniStackingHeightMap} from '@habbo/room/utils/FurniStackingHeightMap';

/** A straight occluder edge in tile space. */
// TS-only: no AS3 counterpart.
export interface IOccluderSegment
{
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

/** A horizontal run of floor tiles on row `y`, covering columns [x0, x1). */
// TS-only: no AS3 counterpart.
export interface IFloorRun
{
    y: number;
    x0: number;
    x1: number;
}

// TS-only: no AS3 counterpart.
export interface IOccluderData
{
    segments: IOccluderSegment[];
    floorRuns: IFloorRun[];
    /** `floorRuns` minus the occupied tiles. */
    litFloorRuns: IFloorRun[];
    /** One byte per tile, 1 where there is floor. Row-major, `width` wide. */
    floor: Uint8Array;
    /** One byte per tile, 1 where the tile blocks light. Row-major. Used for per-object occlusion tests. */
    solid: Uint8Array;
    width: number;
    height: number;
    /** Changes whenever the occluder grid or the floor shape does. Cheap redraw trigger. */
    signature: number;
}

// TS-only: no AS3 counterpart; an empty result for rooms with no height map yet.
const EMPTY: IOccluderData = {
    segments: [],
    floorRuns: [],
    litFloorRuns: [],
    floor: new Uint8Array(0),
    solid: new Uint8Array(0),
    width: 0,
    height: 0,
    signature: 0
};

/**
 * Convert a tile-grid coordinate (a tile index, or a boundary between two of them) to world space.
 *
 * See the file header: tile `t` is centred on world `t`, so its edges are at `t - 0.5` and
 * `t + 0.5`, and a grid line "before tile t" sits at `t - 0.5`.
 */
// TS-only: no AS3 counterpart.
export function gridToWorld(gridCoordinate: number): number
{
    return gridCoordinate - 0.5;
}

/**
 * Convert a world coordinate to the tile that contains it.
 *
 * Rounding, not flooring: with tiles centred on integers, world `5.6` is inside tile `6`, whose
 * span is `[5.5, 6.5]`.
 */
// TS-only: no AS3 counterpart.
export function worldToTile(worldCoordinate: number): number
{
    return Math.round(worldCoordinate);
}

/** Is there floor on this tile? Out of bounds is not floor. */
// TS-only: no AS3 counterpart.
export function isFloorTile(data: IOccluderData, x: number, y: number): boolean
{
    if(x < 0 || x >= data.width || y < 0 || y >= data.height)
    {
        return false;
    }

    return data.floor[y * data.width + x] === 1;
}

/**
 * Build the occluder segments and the floor outline for a room.
 *
 * Silhouette edges only: an edge is emitted where an occluding cell meets a non-occluding one, so
 * a solid block of furniture contributes its outline and not its interior. Collinear edges are
 * merged into runs in the same pass, which collapses a ten-tile wall into one segment — the shadow
 * pass is O(segments), so this is what keeps it cheap.
 */
// TS-only: no AS3 counterpart.
export function buildOccluders(
    map: FurniStackingHeightMap | null,
    minCasterHeight: number,
    extraCasterTiles: readonly {x: number; y: number}[] = []
): IOccluderData
{
    if(map === null || map.width <= 0 || map.height <= 0)
    {
        return EMPTY;
    }

    const width = map.width;
    const height = map.height;

    // Flatten first: `occludes()` is called up to six times per cell below, and the height map's
    // accessors bounds-check on every call.
    const solid: Uint8Array = new Uint8Array(width * height);
    const floor: Uint8Array = new Uint8Array(width * height);

    let signature = (width * 73856093) ^ (height * 19349663);

    for(let y = 0; y < height; y++)
    {
        for(let x = 0; x < width; x++)
        {
            const index = y * width + x;
            const isRoomTile = map.getIsRoomTile(x, y);
            const isSolid = !isRoomTile || map.getTileHeight(x, y) >= minCasterHeight;

            floor[index] = isRoomTile ? 1 : 0;
            solid[index] = isSolid ? 1 : 0;

            if(isSolid || isRoomTile)
            {
                // Order-dependent mix, so a swap of two tiles still changes the signature.
                signature = (signature * 31 + index * (isSolid ? 3 : 1)) | 0;
            }
        }
    }

    // Casters the height map cannot know about — avatars, which live in the room object list and
    // never touch the furniture stacking map.
    for(const tile of extraCasterTiles)
    {
        // Round, not floor: these are world coordinates, and tiles are centred on integers.
        const x = worldToTile(tile.x);
        const y = worldToTile(tile.y);

        if(x < 0 || x >= width || y < 0 || y >= height)
        {
            continue;
        }

        const index = y * width + x;

        if(solid[index] === 0)
        {
            solid[index] = 1;
            signature = (signature * 31 + index * 7 + 11) | 0;
        }
    }

    // Outside the room is solid, so the room's own outline casts too.
    const isSolidAt = (x: number, y: number): boolean =>
    {
        if(x < 0 || x >= width || y < 0 || y >= height)
        {
            return true;
        }

        return solid[y * width + x] === 1;
    };

    const segments: IOccluderSegment[] = [];

    // Vertical edges, one pass per grid line x = 0..width.
    for(let x = 0; x <= width; x++)
    {
        let runStart = -1;

        for(let y = 0; y <= height; y++)
        {
            const isEdge = y < height && isSolidAt(x - 1, y) !== isSolidAt(x, y);

            if(isEdge && runStart === -1)
            {
                runStart = y;
            }
            else if(!isEdge && runStart !== -1)
            {
                segments.push({x1: x, y1: runStart, x2: x, y2: y});
                runStart = -1;
            }
        }
    }

    // Horizontal edges, one pass per grid line y = 0..height.
    for(let y = 0; y <= height; y++)
    {
        let runStart = -1;

        for(let x = 0; x <= width; x++)
        {
            const isEdge = x < width && isSolidAt(x, y - 1) !== isSolidAt(x, y);

            if(isEdge && runStart === -1)
            {
                runStart = x;
            }
            else if(!isEdge && runStart !== -1)
            {
                segments.push({x1: runStart, y1: y, x2: x, y2: y});
                runStart = -1;
            }
        }
    }

    // Floor runs, used as the clip region: the darkness must not spill onto the void or climb the
    // walls, because a flat floor projection is wrong everywhere but the floor.
    const floorRuns: IFloorRun[] = [];
    // The same runs minus the occupied tiles. Used when the darkness has to stay off whatever is
    // standing on the floor — see `keepObjectsLit`.
    const litFloorRuns: IFloorRun[] = [];

    for(let y = 0; y < height; y++)
    {
        let runStart = -1;
        let litRunStart = -1;

        for(let x = 0; x <= width; x++)
        {
            const index = y * width + x;
            const isFloor = x < width && floor[index] === 1;
            const isLitFloor = isFloor && solid[index] === 0;

            if(isFloor && runStart === -1)
            {
                runStart = x;
            }
            else if(!isFloor && runStart !== -1)
            {
                floorRuns.push({y, x0: runStart, x1: x});
                runStart = -1;
            }

            if(isLitFloor && litRunStart === -1)
            {
                litRunStart = x;
            }
            else if(!isLitFloor && litRunStart !== -1)
            {
                litFloorRuns.push({y, x0: litRunStart, x1: x});
                litRunStart = -1;
            }
        }
    }

    return {segments, floorRuns, litFloorRuns, floor, solid, width, height, signature};
}

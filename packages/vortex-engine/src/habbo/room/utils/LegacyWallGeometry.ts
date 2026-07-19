/**
 * LegacyWallGeometry
 *
 * @see source_as_flash/com/sulake/habbo/room/utils/LegacyWallGeometry.as
 *
 * Converts legacy wall tile coordinates to 3D world positions.
 * Wall items use a coordinate system relative to wall tiles with local pixel offsets.
 * This class maps those to proper (x, y, z) positions the room engine can use.
 */
import type {IVector3d} from '@room/utils/IVector3d';
import {Vector3d} from '@room/utils/Vector3d';

export class LegacyWallGeometry
{
    private static readonly L = 'l';
    private static readonly R = 'r';
    private _heightMap: number[][] = [];
    private _width: number = 0;
    private _height: number = 0;
    private _floorHeight: number = 0;

    private _scale: number = 64;

    get scale(): number
    {
        return this._scale;
    }

    set scale(value: number)
    {
        this._scale = value;
    }

    private _disposed: boolean = false;

    get disposed(): boolean
    {
        return this._disposed;
    }

    /**
	 * Initialize height map grid.
	 * Based on AS3 LegacyWallGeometry.initialize()
	 */
    initialize(width: number, height: number, floorHeight: number): void
    {
        if(width <= this._width && height <= this._height)
        {
            this._width = width;
            this._height = height;
            this._floorHeight = floorHeight;
            return;
        }

        this.reset();

        for(let y = 0; y < height; y++)
        {
            const row: number[] = [];

            for(let x = 0; x < width; x++)
            {
                row.push(0);
            }

            this._heightMap.push(row);
        }

        this._width = width;
        this._height = height;
        this._floorHeight = floorHeight;
    }

    /**
	 * Set tile height at position.
	 * Based on AS3 LegacyWallGeometry._Str_3982()
	 */
    setTileHeight(x: number, y: number, height: number): boolean
    {
        if(x < 0 || x >= this._width || y < 0 || y >= this._height)
        {
            return false;
        }

        const row = this._heightMap[y];

        if(row)
        {
            row[x] = height;
            return true;
        }

        return false;
    }

    /**
	 * Get tile height at position.
	 * Based on AS3 LegacyWallGeometry.getTileHeight()
	 */
    getTileHeight(x: number, y: number): number
    {
        if(x < 0 || x >= this._width || y < 0 || y >= this._height)
        {
            return 0;
        }

        const row = this._heightMap[y];
        return row ? row[x] : 0;
    }

    /**
	 * Convert wall coordinates to 3D world position.
	 * Based on AS3 LegacyWallGeometry.getLocation() lines 121-197
	 *
	 * @param wallX - Wall tile X coordinate
	 * @param wallY - Wall tile Y coordinate
	 * @param localX - Local pixel X offset within wall tile
	 * @param localY - Local pixel Y offset (vertical) within wall tile
	 * @param dir - Direction: 'l' (left wall) or 'r' (right wall)
	 */
    getLocation(wallX: number, wallY: number, localX: number, localY: number, dir: string): IVector3d
    {
        // WIN63's getLocation (_SafeCls_1855.as:129-148) is the 15-line world conversion
        // below — nothing else. The port previously carried a ~50-line wall-scan block
        // that rewrote wallX/wallY/localX/localY when both were 0; that block only exists
        // in the 2016 PRODUCTION build and was removed in WIN63. It recalculated by
        // heuristic any wall item legitimately placed on tile (0,0), shifting it on screen.
        // Following the primary source, it is removed.
        let worldX = wallX;
        let worldY = wallY;
        let worldZ = this.getTileHeight(wallX, wallY);
        const halfScale = this._scale / 2;

        if(dir === LegacyWallGeometry.R)
        {
            worldX = worldX + ((localX / halfScale) - 0.5);
            worldY = worldY + 0.5;
            worldZ = worldZ - ((localY - (localX / 2)) / halfScale);
        }
        else
        {
            worldY = worldY + (((halfScale - localX) / halfScale) - 0.5);
            worldX = worldX + 0.5;
            worldZ = worldZ - ((localY - ((halfScale - localX) / 2)) / halfScale);
        }

        return new Vector3d(worldX, worldY, worldZ);
    }

    /**
	 * Get direction angle from direction string.
	 * Based on AS3 LegacyWallGeometry.getDirection()
	 */
    getDirection(dir: string): number
    {
        if(dir === LegacyWallGeometry.R)
        {
            return 180;
        }

        return 90;
    }

    /**
	 * Get floor altitude with half-step adjustment.
	 * Based on AS3 LegacyWallGeometry.getFloorAltitude()
	 */
    getFloorAltitude(x: number, y: number): number
    {
        // AS3 truncates every height to int before comparing (`var _loc4_:int = ...`,
        // `int(getTileHeight(...))`). Comparing raw floats means a fractional tile
        // height never equals h+1, so the +0.5 step bonus vanishes and the returned
        // altitude keeps its fractional part — wall items and floor altitude drift
        // near height changes.
        const h = Math.trunc(this.getTileHeight(x, y));
        const hPlus = h + 1;

        // Check if any adjacent tile is exactly 1 higher
        const hasHigherNeighbor =
            Math.trunc(this.getTileHeight(x - 1, y - 1)) === hPlus
			|| Math.trunc(this.getTileHeight(x, y - 1)) === hPlus
			|| Math.trunc(this.getTileHeight(x + 1, y - 1)) === hPlus
			|| Math.trunc(this.getTileHeight(x - 1, y)) === hPlus
			|| Math.trunc(this.getTileHeight(x + 1, y)) === hPlus
			|| Math.trunc(this.getTileHeight(x - 1, y + 1)) === hPlus
			|| Math.trunc(this.getTileHeight(x, y + 1)) === hPlus
			|| Math.trunc(this.getTileHeight(x + 1, y + 1)) === hPlus;

        return h + (hasHigherNeighbor ? 0.5 : 0);
    }

    /**
	 * Check if position is a valid room tile.
	 * Based on AS3 LegacyWallGeometry.isRoomTile()
	 */
    isRoomTile(x: number, y: number): boolean
    {
        return x >= 0 && x < this._width
			&& y >= 0 && y < this._height
			&& this._heightMap[y]?.[x] >= 0;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/utils/_SafeCls_1855.as::getLocationOldFormat()
    // Positions an old-format wall item (which carries y/z instead of wallX/wallY/localX/localY):
    // scans columns for the first non-wall tile at the item's row to find the wall tile, then
    // hands off to getLocation(). AS3 truncates the local offsets to int (see the int locals).
    getLocationOldFormat(y: number, z: number, dir: string): IVector3d
    {
        let wallY = Math.ceil(y);
        const frac = wallY - y;
        let wallX = 0;
        let tileY = 0;
        let localOffset = 0;
        let side = dir;
        let ix = 0;

        while(ix < this._width)
        {
            if(wallY >= 0 && wallY < this._height)
            {
                if(this.getTileHeight(ix, wallY) <= this._floorHeight)
                {
                    wallX = Math.trunc(ix - 1);
                    tileY = wallY;
                    localOffset = ix;
                    side = 'l';

                    break;
                }

                if(this.getTileHeight(ix, wallY + 1) <= this._floorHeight)
                {
                    wallX = ix;
                    tileY = wallY;
                    localOffset = tileY - y;
                    side = 'r';

                    break;
                }
            }

            wallY++;
            ix++;
        }

        const localX = Math.trunc(this._scale / 2 * frac);
        let offset = -localOffset * this._scale / 2;
        offset += -z * 18 / 32 * this._scale / 2;

        const tileHeight = this.getTileHeight(wallX, tileY);
        let localY = Math.trunc(tileHeight * this._scale / 2 + offset);

        if(side === 'r')
        {
            localY = Math.trunc(localY + frac * this._scale / 4);
        }
        else
        {
            localY = Math.trunc(localY + (1 - frac) * this._scale / 4);
        }

        return this.getLocation(wallX, tileY, localX, localY, side);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/utils/_SafeCls_1855.as::getOldLocation()
    // Inverse of getLocation: from a world position + wall direction, recover the
    // [wallX, wallY, localX, localY, side] the server's old wall format expects.
    getOldLocation(location: IVector3d | null, direction: number): [number, number, number, number, string] | null
    {
        if(location === null)
        {
            return null;
        }

        let wallX: number;
        let wallY: number;
        let localX: number;
        let localY: number;
        let side: string;
        let tileHeight: number;

        if(direction === 90)
        {
            wallX = Math.floor(location.x - 0.5);
            wallY = Math.floor(location.y + 0.5);
            tileHeight = this.getTileHeight(wallX, wallY);
            localX = this._scale / 2 - (location.y - wallY + 0.5) * (this._scale / 2);
            localY = (tileHeight - location.z) * (this._scale / 2) + (this._scale / 2 - localX) / 2;
            side = 'l';
        }
        else if(direction === 180)
        {
            wallX = Math.floor(location.x + 0.5);
            wallY = Math.floor(location.y - 0.5);
            tileHeight = this.getTileHeight(wallX, wallY);
            localX = (location.x + 0.5 - wallX) * (this._scale / 2);
            localY = (tileHeight - location.z) * (this._scale / 2) + localX / 2;
            side = 'r';
        }
        else
        {
            return null;
        }

        return [wallX, wallY, localX, localY, side];
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/utils/_SafeCls_1855.as::getOldLocationString()
    // Serialises a wall position to the ":w=wallX,wallY l=localX,localY side" string the
    // server expects when placing a wall item. AS3 truncates every field to int.
    getOldLocationString(location: IVector3d | null, direction: number): string | null
    {
        const parts = this.getOldLocation(location, direction);

        if(parts === null)
        {
            return null;
        }

        const wallX = Math.trunc(parts[0]);
        const wallY = Math.trunc(parts[1]);
        const localX = Math.trunc(parts[2]);
        const localY = Math.trunc(parts[3]);
        const side = parts[4];

        return ':w=' + wallX + ',' + wallY + ' l=' + localX + ',' + localY + ' ' + side;
    }

    dispose(): void
    {
        this.reset();
        this._disposed = true;
    }

    private reset(): void
    {
        this._heightMap = [];
    }
}

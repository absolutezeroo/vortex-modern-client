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
        // Auto-detect wall position when wallX=0 and wallY=0 (AS3 lines 126-179)
        if(wallX === 0 && wallY === 0)
        {
            wallX = this._width;
            wallY = this._height;
            const localRound = Math.round(this._scale / 10);

            if(dir === LegacyWallGeometry.R)
            {
                // Scan right-facing walls from right edge
                for(let ix = this._width - 1; ix >= 0; ix--)
                {
                    for(let iy = 1; iy < this._height; iy++)
                    {
                        if(this.getTileHeight(ix, iy) <= this._floorHeight)
                        {
                            if((iy - 1) < wallY)
                            {
                                wallX = ix;
                                wallY = iy - 1;
                            }
                            break;
                        }
                    }
                }

                localY = localY + ((this._scale / 4) - (localRound / 2));
                localX = localX + (this._scale / 2);
            }
            else
            {
                // Scan left-facing walls from bottom edge
                for(let iy = this._height - 1; iy >= 0; iy--)
                {
                    for(let ix = 1; ix < this._width; ix++)
                    {
                        if(this.getTileHeight(ix, iy) <= this._floorHeight)
                        {
                            if((ix - 1) < wallX)
                            {
                                wallX = ix - 1;
                                wallY = iy;
                            }
                            break;
                        }
                    }
                }

                localY = localY + ((this._scale / 4) - (localRound / 2));
                localX = localX - localRound;
            }
        }

        // Convert to world coordinates (AS3 lines 180-196)
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
        const h = this.getTileHeight(x, y);
        const hPlus = h + 1;

        // Check if any adjacent tile is exactly 1 higher
        const hasHigherNeighbor =
            this.getTileHeight(x - 1, y - 1) === hPlus
			|| this.getTileHeight(x, y - 1) === hPlus
			|| this.getTileHeight(x + 1, y - 1) === hPlus
			|| this.getTileHeight(x - 1, y) === hPlus
			|| this.getTileHeight(x + 1, y) === hPlus
			|| this.getTileHeight(x - 1, y + 1) === hPlus
			|| this.getTileHeight(x, y + 1) === hPlus
			|| this.getTileHeight(x + 1, y + 1) === hPlus;

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

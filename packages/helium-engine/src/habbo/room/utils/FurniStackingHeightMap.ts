/**
 * FurniStackingHeightMap
 *
 * @see source_as_flash/com/sulake/habbo/room/utils/FurniStackingHeightMap.as
 *
 * Tracks furniture stacking heights per tile and validates placement positions.
 * Uses flat 1D arrays for efficient access.
 */
export class FurniStackingHeightMap
{
    private _heightMap: number[];
    private _isNotStackable: boolean[];
    private _isRoomTile: boolean[];

    constructor(width: number, height: number)
    {
        this._width = width;
        this._height = height;
        const size = width * height;
        this._heightMap = new Array(size).fill(0);
        this._isNotStackable = new Array(size).fill(false);
        this._isRoomTile = new Array(size).fill(false);
    }

    private _width: number;

    get width(): number
    {
        return this._width;
    }

    private _height: number;

    get height(): number
    {
        return this._height;
    }

    /**
	 * Get tile height at position.
	 */
    getTileHeight(x: number, y: number): number
    {
        if(x < 0 || x >= this._width || y < 0 || y >= this._height) return 0;

        return this._heightMap[y * this._width + x];
    }

    /**
	 * Set tile height at position.
	 * Based on AS3 FurniStackingHeightMap._Str_3982()
	 */
    setTileHeight(x: number, y: number, height: number): void
    {
        if(x < 0 || x >= this._width || y < 0 || y >= this._height) return;

        this._heightMap[y * this._width + x] = height;
    }

    /**
	 * Set whether stacking is blocked on a tile.
	 */
    setStackingBlocked(x: number, y: number, blocked: boolean): void
    {
        if(x < 0 || x >= this._width || y < 0 || y >= this._height) return;

        this._isNotStackable[y * this._width + x] = blocked;
    }

    /**
	 * Check if stacking is blocked on a tile.
	 */
    isStackingBlocked(x: number, y: number): boolean
    {
        if(x < 0 || x >= this._width || y < 0 || y >= this._height) return true;

        return this._isNotStackable[y * this._width + x];
    }

    /**
	 * Set whether a position is a valid room tile.
	 */
    setIsRoomTile(x: number, y: number, isRoom: boolean): void
    {
        if(x < 0 || x >= this._width || y < 0 || y >= this._height) return;

        this._isRoomTile[y * this._width + x] = isRoom;
    }

    /**
	 * Check if a position is a valid room tile.
	 */
    getIsRoomTile(x: number, y: number): boolean
    {
        if(x < 0 || x >= this._width || y < 0 || y >= this._height) return false;

        return this._isRoomTile[y * this._width + x];
    }

    /**
	 * Validate whether furniture can be placed at a location.
	 * Based on AS3 FurniStackingHeightMap.validateLocation()
	 *
	 * @param x - Target X position
	 * @param y - Target Y position
	 * @param sizeX - Furniture width
	 * @param sizeY - Furniture depth
	 * @param limitX - Limit rectangle X (e.g., existing furniture to ignore)
	 * @param limitY - Limit rectangle Y
	 * @param limitWidth - Limit rectangle width
	 * @param limitHeight - Limit rectangle height
	 * @param requireRoomTile - If true, requires all tiles are room tiles
	 * @param maxHeight - Maximum allowed height (-1 for no limit)
	 */
    validateLocation(
        x: number, y: number,
        sizeX: number, sizeY: number,
        limitX: number, limitY: number,
        limitWidth: number, limitHeight: number,
        requireRoomTile: boolean,
        maxHeight: number = -1
    ): boolean
    {
        if(x < 0 || x + sizeX > this._width || y < 0 || y + sizeY > this._height)
        {
            return false;
        }

        let firstHeight = -1;

        for(let ix = x; ix < x + sizeX; ix++)
        {
            for(let iy = y; iy < y + sizeY; iy++)
            {
                // Skip tiles inside the limit rectangle (ignore existing furniture)
                if(ix >= limitX && ix < limitX + limitWidth
					&& iy >= limitY && iy < limitY + limitHeight)
                {
                    continue;
                }

                const idx = iy * this._width + ix;

                if(requireRoomTile)
                {
                    if(!this._isRoomTile[idx]) return false;
                }
                else
                {
                    if(!this._isRoomTile[idx]) return false;
                    if(this._isNotStackable[idx]) return false;

                    const tileHeight = this._heightMap[idx];

                    if(firstHeight < 0)
                    {
                        firstHeight = tileHeight;
                    }
                    else if(Math.abs(tileHeight - firstHeight) > 0.01)
                    {
                        return false;
                    }

                    if(maxHeight >= 0 && tileHeight > maxHeight)
                    {
                        return false;
                    }
                }
            }
        }

        return true;
    }

    dispose(): void
    {
        this._heightMap = [];
        this._isNotStackable = [];
        this._isRoomTile = [];
    }
}

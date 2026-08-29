import {OrderedMap} from '@core/utils/OrderedMap';
import type {FuseObjectData} from '@habbo/communication/messages/parser/game/snowwar/data/FuseObjectData';
import type {GameLevelData} from '@habbo/communication/messages/parser/game/snowwar/data/GameLevelData';

import type {ISynchronizedGameObject} from './arena/ISynchronizedGameObject';
import type {SynchronizedGameArena} from './arena/SynchronizedGameArena';
import {SynchronizedGameStage} from './arena/SynchronizedGameStage';
import type {SnowWarGameObject} from './gameobjects/SnowWarGameObject';
import {Direction360} from './utils/Direction360';
import {Direction8} from './utils/Direction8';
import type {ICollidable} from './utils/ICollidable';
import {Tile} from './Tile';

/**
 * The arena floor: a grid of tiles built from the level's height map, and everything standing on it.
 *
 * The height map is a string, one row per `\r`-separated line, one character per tile: a digit is
 * that height, `x` is a hole, and any other letter is `10 + (letter - 'a')` — so heights above 9
 * continue into the alphabet. A hole produces no tile at all, which is what makes
 * `getTileAt()` answer null for it and every walk and every snowball stop there.
 *
 * **Only the holes are used.** `linkTiles()` decodes every character and then tests one thing —
 * whether it is the no-tile sentinel. The height it decoded is discarded, and a tile's height comes
 * entirely from the scenery standing on it. That is why `parseHeightMap()` also computes a tallest
 * height nobody reads: the whole numeric half of the format is vestigial in this build.
 *
 * Tiles are linked to their neighbours as they are created, and only ever **backwards** — N, NE, NW
 * and W — because `linkTile()` links both ways at once and the tiles ahead do not exist yet.
 *
 * The class name is recovered from the 2016 tree, where it is unobfuscated; the primary tree has it
 * as `_SafeCls_2604`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/game/snowwar/_SafeCls_2604.as
 * @see sources/PRODUCTION-201601012205-226667486/src/snowwar/SnowWarGameStage.as
 */
export class SnowWarGameStage extends SynchronizedGameStage
{
    // AS3: _SafeCls_2604.as::SCREEN_CENTER_TILE_X
    public static readonly SCREEN_CENTER_TILE_X: number = 25;

    // AS3: _SafeCls_2604.as::SCREEN_CENTER_TILE_Y
    public static readonly SCREEN_CENTER_TILE_Y: number = 25;

    /** The sentinel a height map's `x` becomes: a square with no tile. */
    // AS3: _SafeCls_2604.as::INFINITE_HEIGHT
    private static readonly INFINITE_HEIGHT: number = 100000;

    /** Row-major — `_tiles[y][x]`, which is why `getTileAt()` takes x first and indexes second. */
    // AS3: _SafeCls_2604.as::_tiles
    private _tiles: (Tile | null)[][] = [];

    /** Which way a tile faces if it is to face the middle of the arena. */
    // AS3: _SafeCls_2604.as::calculateDirectionTowardsCenter()
    public static calculateDirectionTowardsCenter(tile: Tile): Direction8
    {
        return Direction8.requireDirection8(
            Direction360.direction360ValueToDirection8(
                Direction360.getAngleFromComponents(25 - tile.fuseLocation[0], 25 - tile.fuseLocation[1])
            )
        );
    }

    /**
     * Builds the grid, then lays the scenery over it. The object map is created here rather than in
     * the constructor because AS3 allows `initialize()` to be called on a stage that already has
     * one, and it must not be thrown away.
     */
    // AS3: _SafeCls_2604.as::initialize()
    public override initialize(gameArena: SynchronizedGameArena, gameLevelData: GameLevelData): void
    {
        super.initialize(gameArena, gameLevelData);

        if(this._gameObjects === null)
        {
            this._gameObjects = new OrderedMap<number, ISynchronizedGameObject>();
        }

        this.linkTiles(gameLevelData);
        this.addFuseObjectsAndHeights(gameLevelData.fuseObjects);
    }

    /** Scenery whose square has no tile is dropped silently — there is nothing to stand on. */
    // AS3: _SafeCls_2604.as::addFuseObjectsAndHeights()
    private addFuseObjectsAndHeights(fuseObjects: FuseObjectData[]): void
    {
        for(const fuseObject of fuseObjects)
        {
            const tile = this.getTileAt(fuseObject.x, fuseObject.y);

            if(tile)
            {
                tile.addFuseObject(fuseObject);
                this.checkAndAdjustNeighbouringTiles(fuseObject);
            }
        }
    }

    /**
     * A piece of scenery wider than one tile raises — and possibly blocks — the tiles it covers.
     *
     * Facing east or west swaps its two dimensions, which is the only rotation the arena models.
     * Both loops start at 1 because the origin tile was already handled by the caller, and they walk
     * the two axes **independently**: an L, not a rectangle. A 3×3 object leaves its far corner
     * untouched, and that is AS3's behaviour, not an omission here.
     */
    // AS3: _SafeCls_2604.as::checkAndAdjustNeighbouringTiles()
    private checkAndAdjustNeighbouringTiles(fuseObject: FuseObjectData): void
    {
        const direction = fuseObject.direction;
        let xDimension = fuseObject.xDimension;
        let yDimension = fuseObject.yDimension;

        if(direction === Direction8.E.intValue() || direction === Direction8.W.intValue())
        {
            const swap = xDimension;

            xDimension = yDimension;
            yDimension = swap;
        }

        let offset = 1;

        while(offset < xDimension)
        {
            const tile = this.getTileAt(fuseObject.x + offset, fuseObject.y);

            if(tile)
            {
                tile.addToHeight(fuseObject.height);

                if(!fuseObject.canStandOn)
                {
                    tile.blocked = true;
                }
            }

            offset++;
        }

        offset = 1;

        while(offset < yDimension)
        {
            const tile = this.getTileAt(fuseObject.x, fuseObject.y + offset);

            if(tile)
            {
                tile.addToHeight(fuseObject.height);

                if(!fuseObject.canStandOn)
                {
                    tile.blocked = true;
                }
            }

            offset++;
        }
    }

    /** Places an object on whichever tile its own location falls on, if that tile exists. */
    // AS3: _SafeCls_2604.as::addGameObjectToTile()
    public addGameObjectToTile(gameObject: SnowWarGameObject): void
    {
        const location = gameObject.location3D;
        const tile = this.getTileAt(Tile.convertToTileX(location.x), Tile.convertToTileY(location.y));

        if(tile)
        {
            tile.addGameObject(gameObject);
        }
    }

    // AS3: _SafeCls_2604.as::linkTiles()
    private linkTiles(gameLevelData: GameLevelData): void
    {
        const heights = this.parseHeightMap(gameLevelData.heightMap, gameLevelData.width, gameLevelData.height);
        const rows = gameLevelData.height;
        const columns = gameLevelData.width;

        this._tiles = [];

        let y = 0;

        while(y < rows)
        {
            this._tiles[y] = [];

            let x = 0;

            while(x < columns)
            {
                this._tiles[y][x] = null;

                if(heights[y][x] !== 100000)
                {
                    const tile = new Tile(x, y);

                    this._tiles[y][x] = tile;

                    const northEast = this.getTileAt(x + 1, y - 1);

                    if(northEast !== null)
                    {
                        tile.linkTile(northEast, Direction8.NE);
                    }

                    const north = this.getTileAt(x, y - 1);

                    if(north !== null)
                    {
                        tile.linkTile(north, Direction8.N);
                    }

                    const northWest = this.getTileAt(x - 1, y - 1);

                    if(northWest !== null)
                    {
                        tile.linkTile(northWest, Direction8.NW);
                    }

                    const west = this.getTileAt(x - 1, y);

                    if(west !== null)
                    {
                        tile.linkTile(west, Direction8.W);
                    }
                }

                x++;
            }

            y++;
        }
    }

    // AS3: _SafeCls_2604.as::getTiles()
    public getTiles(): (Tile | null)[][]
    {
        return this._tiles;
    }

    /**
     * A snowball is on the ground once it is below z 1, or below the height of whatever is standing
     * on the tile beneath it. Off the grid it never lands — it simply flies until its own time runs
     * out.
     */
    // AS3: _SafeCls_2604.as::testCollisionWithGround()
    public testCollisionWithGround(collidable: ICollidable): boolean
    {
        if(collidable.location3D.z < 1)
        {
            return true;
        }

        const tile = this.getTileAt(
            Tile.convertToTileX(collidable.location3D.x), Tile.convertToTileY(collidable.location3D.y)
        );

        if(tile)
        {
            return collidable.location3D.z < tile.height;
        }

        return false;
    }

    /** Asks with no mover, so the ghost clause in `Tile.canMoveTo()` cannot apply. */
    // AS3: _SafeCls_2604.as::positionIsWalkable()
    public positionIsWalkable(x: number, y: number): boolean
    {
        const tile = this.getTileAt(Tile.convertToTileX(x), Tile.convertToTileY(y));

        if(tile)
        {
            return tile.canMoveTo(null);
        }

        return false;
    }

    // AS3: _SafeCls_2604.as::getTileAt()
    public getTileAt(x: number, y: number): Tile | null
    {
        const firstRow = this._tiles[0];

        // AS3 reads `_tiles[0].length` unguarded and fails on a stage whose grid was never built.
        // The port answers null instead, which every caller already handles.
        if(!firstRow)
        {
            return null;
        }

        if(x < 0 || x >= firstRow.length || y < 0 || y >= this._tiles.length)
        {
            return null;
        }

        return this._tiles[y][x] ?? null;
    }

    /**
     * Rows are `\r`-separated and each character is one tile's height: a digit as itself, `x` as the
     * no-tile sentinel, anything else as `10 + (char - 'a')`.
     *
     * Each row is filled **right to left**, which matters only because a row shorter than the level
     * width leaves holes at the low indices rather than the high ones.
     *
     * AS3 also tracks the tallest height it saw and then discards it; the port drops that local
     * rather than computing a number nothing reads.
     */
    // AS3: _SafeCls_2604.as::parseHeightMap()
    private parseHeightMap(heightMap: string, width: number, height: number): number[][]
    {
        void width;
        void height;

        const lines = heightMap.split('\r');
        const heights: number[][] = [];
        let lineIndex = 0;

        while(lineIndex < lines.length)
        {
            const line = lines[lineIndex];

            heights[lineIndex] = [];

            let column = line.length - 1;

            while(column >= 0)
            {
                const character = line.charAt(column);
                const digit = parseInt(character, 10);

                if(!isNaN(digit))
                {
                    heights[lineIndex][column] = digit;
                }
                else if(character === 'x')
                {
                    heights[lineIndex][column] = 100000;
                }
                else
                {
                    heights[lineIndex][column] = 10 + (character.charCodeAt(0) - 'a'.charCodeAt(0));
                }

                column--;
            }

            lineIndex++;
        }

        return heights;
    }

    /** Clears every tile's occupant without disposing anything — a round reset, not a teardown. */
    // AS3: _SafeCls_2604.as::resetTiles()
    public resetTiles(): void
    {
        if(this._tiles && this._tiles.length > 0)
        {
            let y = 0;

            while(y < this._tiles.length)
            {
                let x = 0;

                while(x < this._tiles[0].length)
                {
                    const tile = this._tiles[y][x];

                    if(tile)
                    {
                        tile.removeGameObject();
                    }

                    x++;
                }

                y++;
            }
        }
    }

    // AS3: _SafeCls_2604.as::dispose()
    public override dispose(): void
    {
        super.dispose();

        if(this._tiles && this._tiles.length > 0)
        {
            let y = 0;

            while(y < this._tiles.length)
            {
                let x = 0;

                while(x < this._tiles[0].length)
                {
                    const tile = this._tiles[y][x];

                    if(tile)
                    {
                        tile.dispose();
                    }

                    x++;
                }

                y++;
            }
        }

        this._tiles = [];
    }
}

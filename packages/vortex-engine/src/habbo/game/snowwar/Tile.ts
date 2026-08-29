import type {FuseObjectData} from '@habbo/communication/messages/parser/game/snowwar/data/FuseObjectData';

import type {IGameObject} from './arena/IGameObject';
import {HumanGameObject} from './gameobjects/HumanGameObject';
import type {SnowWarGameObject} from './gameobjects/SnowWarGameObject';
import {AbstractAStarNode} from './utils/AbstractAStarNode';
import type {Direction8} from './utils/Direction8';
import type {IAStarNode} from './utils/IAStarNode';
import {Location3D} from './utils/Location3D';
import {MathUtils} from './utils/MathUtils';

/**
 * One square of the arena floor, and an A* node.
 *
 * A tile holds at most **one** game object — that is the whole occupancy model, and it is why a
 * player crossing a boundary occupies both the tile they left and the one they are entering until
 * they arrive. Scenery is separate: `fuseObjects` is a list, and a tile with more than one is
 * unwalkable regardless of what any single piece says.
 *
 * All distances are in the same fixed-point unit as everything else in the simulation, 3,200 to a
 * tile, so that no coordinate is ever fractional and no two clients round differently.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/game/snowwar/Tile.as
 */
export class Tile extends AbstractAStarNode
{
    // AS3: Tile.as::TILE_WIDTH
    public static readonly TILE_WIDTH: number = 3200;

    // AS3: Tile.as::TILE_HALFWIDTH
    public static readonly TILE_HALFWIDTH: number = MathUtils.javaDiv(3200 / 2);

    // AS3: Tile.as::TILE_ONEANDHALFWIDTH
    public static readonly TILE_ONEANDHALFWIDTH: number = 3200 + Tile.TILE_HALFWIDTH;

    /**
     * The diagonal of a tile, `trunc(sqrt(3200² × 2))` = 4,525. `Math.sqrt` is safe here where the
     * simulation may not use it: this is a compile-time constant, identical on every client, not a
     * per-frame computation whose rounding could drift from the server's.
     */
    // AS3: Tile.as::TILE_DIAMETER
    public static readonly TILE_DIAMETER: number = Math.trunc(Math.sqrt(20480000));

    /** Derived name — `_SafeStr_5184`, from the `location` getter that reads it. */
    // AS3: Tile.as::_SafeStr_5184
    private _location: Location3D | null = null;

    // AS3: Tile.as::_neighbouringTiles
    private _neighbouringTiles: (Tile | null)[] = [];

    // AS3: Tile.as::_gameObject
    private _gameObject: SnowWarGameObject | null = null;

    /** Derived name — `_SafeStr_8305`, from the `fuseLocation` getter that reads it. */
    // AS3: Tile.as::_SafeStr_8305
    private _fuseLocation: number[] = [];

    /** Derived name — `_SafeStr_7665`, from the `fuseObjects` getter that reads it. */
    // AS3: Tile.as::_SafeStr_7665
    private _fuseObjects: FuseObjectData[] = [];

    /** Derived name — `_SafeStr_7814`, from the `blocked` setter that writes it. */
    // AS3: Tile.as::_SafeStr_7814
    private _blocked: boolean = false;

    /** Derived name — `_SafeStr_4970`, from the `height` getter that reads it. */
    // AS3: Tile.as::_SafeStr_4970
    private _height: number = 0;

    /**
     * `fuseLocation` keeps the tile's grid coordinates with a third slot that is always 0, while
     * `location` is the same square in simulation units. Both are stored because the scenery data
     * speaks grid and the physics speaks units.
     */
    // AS3: Tile.as::Tile()
    public constructor(x: number, y: number)
    {
        super();

        this._neighbouringTiles = [];
        this._fuseLocation = [x, y, 0];
        this._location = new Location3D(x * 3200, y * 3200, 0);
        this._fuseObjects = [];
    }

    /**
     * The half-width offset is what makes a coordinate round to the *nearest* tile rather than the
     * one below it, and `javaDiv` rather than `Math.floor` is what keeps a negative coordinate
     * agreeing with the server.
     */
    // AS3: Tile.as::convertToTileX()
    public static convertToTileX(x: number): number
    {
        return MathUtils.javaDiv((x + Tile.TILE_HALFWIDTH) / 3200);
    }

    // AS3: Tile.as::convertToTileY()
    public static convertToTileY(y: number): number
    {
        return MathUtils.javaDiv((y + Tile.TILE_HALFWIDTH) / 3200);
    }

    // AS3: Tile.as::convertFromTileX()
    public static convertFromTileX(x: number): number
    {
        return x * 3200;
    }

    // AS3: Tile.as::convertFromTileY()
    public static convertFromTileY(y: number): number
    {
        return y * 3200;
    }

    // AS3: Tile.as::get fuseObjects()
    public get fuseObjects(): FuseObjectData[]
    {
        return this._fuseObjects;
    }

    // AS3: Tile.as::addFuseObject()
    public addFuseObject(fuseObject: FuseObjectData): void
    {
        this.fuseObjects.push(fuseObject);
        this.addToHeight(fuseObject.height);
    }

    /** Clamped at zero, so removing more height than was added leaves the floor rather than a pit. */
    // AS3: Tile.as::addToHeight()
    public addToHeight(height: number): void
    {
        this._height += height;

        if(this._height < 0)
        {
            this._height = 0;
        }
    }

    // AS3: Tile.as::get fuseLocation()
    public get fuseLocation(): number[]
    {
        return this._fuseLocation;
    }

    // AS3: Tile.as::get location()
    public get location(): Location3D
    {
        return this._location as Location3D;
    }

    /** Strict on both axes, so a point exactly half a tile away counts as outside. */
    // AS3: Tile.as::locationIsInTileRange()
    public locationIsInTileRange(location: Location3D): boolean
    {
        let dx = this.location.x - location.x;

        if(dx < 0)
        {
            dx = -dx;
        }

        let dy = this.location.y - location.y;

        if(dy < 0)
        {
            dy = -dy;
        }

        return dx < Tile.TILE_HALFWIDTH && dy < Tile.TILE_HALFWIDTH;
    }

    /** Links both ways at once — the neighbour gets the opposite direction back. */
    // AS3: Tile.as::linkTile()
    public linkTile(tile: Tile, direction: Direction8): void
    {
        this.createLinkToTile(tile, direction);
        tile.createLinkToTile(this, direction.oppositeDirection());
    }

    // AS3: Tile.as::createLinkToTile()
    private createLinkToTile(tile: Tile, direction: Direction8): void
    {
        this._neighbouringTiles[direction.intValue()] = tile;
    }

    // AS3: Tile.as::getTileInDirection()
    public getTileInDirection(direction: Direction8): Tile | null
    {
        return this._neighbouringTiles[direction.intValue()] ?? null;
    }

    /**
     * Whether `mover` may step here.
     *
     * The ghost clause is the lock-step machinery: a predicted copy of a player is allowed onto the
     * tile its own real object already occupies, because they are the same person one turn apart.
     *
     * One piece of scenery is walkable if it says so; **two or more never are**, whatever each says
     * on its own.
     */
    // AS3: Tile.as::canMoveTo()
    public canMoveTo(mover: IGameObject | null): boolean
    {
        let moverIsOwnGhost = false;

        if(mover)
        {
            const human = this.occupyingHuman;

            moverIsOwnGhost = human !== null && mover.isGhost && human.ghostObjectId === mover.gameObjectId;
        }

        let sceneryBlocks = false;

        if(this.fuseObjects.length === 1)
        {
            sceneryBlocks = !this.fuseObjects[0].canStandOn;
        }
        else if(this.fuseObjects.length > 1)
        {
            sceneryBlocks = true;
        }

        return !sceneryBlocks && (this._gameObject === null || moverIsOwnGhost) && !this._blocked;
    }

    /** Answers false when the tile is already taken — it never displaces the current occupant. */
    // AS3: Tile.as::addGameObject()
    public addGameObject(gameObject: SnowWarGameObject): boolean
    {
        let added = false;

        if(!this._gameObject)
        {
            this._gameObject = gameObject;
            added = true;
        }

        return added;
    }

    // AS3: Tile.as::removeGameObject()
    public removeGameObject(): SnowWarGameObject | null
    {
        let removed: SnowWarGameObject | null = null;

        if(this._gameObject)
        {
            removed = this._gameObject;
            this._gameObject = null;
        }

        return removed;
    }

    // AS3: Tile.as::get gameObject()
    public get gameObject(): SnowWarGameObject | null
    {
        return this._gameObject;
    }

    // AS3: Tile.as::get occupyingHuman()
    public get occupyingHuman(): HumanGameObject | null
    {
        if(this._gameObject && this._gameObject instanceof HumanGameObject)
        {
            return this._gameObject;
        }

        return null;
    }

    /** Clears the tile only if a *human* holds it — scenery stays. */
    // AS3: Tile.as::removeOccupyingHuman()
    public removeOccupyingHuman(): HumanGameObject | null
    {
        const human = this.occupyingHuman;

        if(human)
        {
            this._gameObject = null;
        }

        return human;
    }

    // AS3: Tile.as::distanceTo()
    public override distanceTo(node: IAStarNode): number
    {
        return this.location.distanceTo((node as Tile).location);
    }

    // AS3: Tile.as::directionTo()
    public override directionTo(node: IAStarNode): Direction8 | null
    {
        return this.location.directionTo((node as Tile).location);
    }

    // AS3: Tile.as::getNodeAt()
    public override getNodeAt(direction: Direction8): IAStarNode | null
    {
        return this._neighbouringTiles[direction.intValue()] ?? null;
    }

    /**
     * **Returns whether the mover can move, not whether the direction is blocked** — the method
     * answers the opposite of its own name, in every tree. Transcribed as written: A* is the only
     * caller, both sides of the wire run this same code, and inverting it here would change which
     * paths this client picks and desynchronise it from the server.
     */
    // AS3: Tile.as::directionIsBlocked()
    public override directionIsBlocked(direction: Direction8, mover: IGameObject): boolean
    {
        void direction;

        return this.canMoveTo(mover);
    }

    /**
     * **The two constants look swapped and are not.** `Direction8.isDiagonal()` answers true for the
     * four *cardinal* directions (see its comment), so this charges a tile's width for a straight
     * step and a tile's diagonal for a diagonal one — which is right. Fixing either half alone
     * inverts the path costs.
     */
    // AS3: Tile.as::getPathCost()
    public override getPathCost(direction: Direction8, mover: IGameObject): number
    {
        void mover;

        if(direction.isDiagonal())
        {
            return 3200;
        }

        return Tile.TILE_DIAMETER;
    }

    // AS3: Tile.as::get height()
    public get height(): number
    {
        return this._height;
    }

    // AS3: Tile.as::set blocked()
    public set blocked(blocked: boolean)
    {
        this._blocked = blocked;
    }

    // AS3: Tile.as::toString()
    public toString(): string
    {
        return ` X:${this.location.x} Y:${this.location.y} Z:${this.location.z}`;
    }

    // AS3: Tile.as::dispose()
    public override dispose(): void
    {
        super.dispose();

        if(this._location !== null)
        {
            this._location.dispose();
            this._location = null;
        }

        this._neighbouringTiles = [];
        this._gameObject = null;
        this._fuseLocation = [];
        this._fuseObjects = [];
        this._blocked = false;
    }
}

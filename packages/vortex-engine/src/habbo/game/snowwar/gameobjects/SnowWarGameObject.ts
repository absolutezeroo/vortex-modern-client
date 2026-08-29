import type {ISynchronizedGameObject} from '../arena/ISynchronizedGameObject';
import type {SynchronizedGameStage} from '../arena/SynchronizedGameStage';
import type {SnowWarGameStage} from '../SnowWarGameStage';
import {CollisionUtils} from '../utils/CollisionUtils';
import type {Direction360} from '../utils/Direction360';
import type {ICollidable} from '../utils/ICollidable';
import type {Location3D} from '../utils/Location3D';
import type {SnowBallGameObject} from './SnowBallGameObject';

/**
 * Base of everything the arena simulates: a snowball, a tree, a pile, a machine, a player.
 *
 * **A ghost's id is assigned twice, and the second one is the one that counts.** The constructor
 * negates it — `new SnowWarGameObject(7, true)` gets -7 — but that value never survives: the one
 * place ghosts are created (`_SafeCls_1951`, the incoming-message handler) immediately writes
 * `ghost.gameObjectId = real.ghostObjectId`, which is `-(7 + 1)` = -8. That is what the `set
 * gameObjectId` accessor exists for, it is the key the ghost is filed under in the stage, and it is
 * what `Tile.canMoveTo()` compares against `occupyingHuman.ghostObjectId` to let a player's own
 * prediction onto the tile the real object holds. A ghost still holding the constructor's -7 would
 * match nothing.
 *
 * The three `ICollidable` shape accessors answer null on the base and are overridden by every
 * subclass that can actually be hit; `boundingType` 0 is what keeps `CollisionUtils` from ever
 * dereferencing them. See `get location3D()` for how the port types that.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/game/snowwar/gameobjects/SnowWarGameObject.as
 */
export class SnowWarGameObject implements ISynchronizedGameObject, ICollidable
{
    // AS3: SnowWarGameObject.as::_active
    protected _active: boolean = false;

    /** Name recovered from the 2016 tree, where it is `_id` — `_SafeStr_5200` in the primary. */
    // AS3: SnowWarGameObject.as::_SafeStr_5200
    protected _id: number = -1;

    /** Derived name — `_SafeStr_7973`, from the `isGhost` getter that reads it. */
    // AS3: SnowWarGameObject.as::_SafeStr_7973
    protected _isGhost: boolean = false;

    /** Name recovered from the 2016 tree — `_SafeStr_5769` in the primary. */
    // AS3: SnowWarGameObject.as::_SafeStr_5769
    private _disposed: boolean = false;

    // AS3: SnowWarGameObject.as::SnowWarGameObject()
    public constructor(id: number, isGhost: boolean)
    {
        this._id = isGhost ? -id : id;
        this._isGhost = isGhost;
    }

    // AS3: SnowWarGameObject.as::get isActive()
    public get isActive(): boolean
    {
        return this._active;
    }

    // AS3: SnowWarGameObject.as::set isActive()
    public set isActive(active: boolean)
    {
        this._active = active;
    }

    /** -1 on the base: an object that declares no variables is not part of the checksum. */
    // AS3: SnowWarGameObject.as::get numberOfVariables()
    public get numberOfVariables(): number
    {
        return -1;
    }

    // AS3: SnowWarGameObject.as::getVariable()
    public getVariable(index: number): number
    {
        void index;

        return -1;
    }

    // AS3: SnowWarGameObject.as::get gameObjectId()
    public get gameObjectId(): number
    {
        return this._id;
    }

    /**
     * Exists for exactly one caller: the incoming-message handler re-files a freshly built ghost
     * under `real.ghostObjectId`. See the class comment — nothing else reassigns an id.
     */
    // AS3: SnowWarGameObject.as::set gameObjectId()
    public set gameObjectId(id: number)
    {
        this._id = id;
    }

    // AS3: SnowWarGameObject.as::subturn()
    public subturn(stage: SynchronizedGameStage): void
    {
        void stage;
    }

    /** 0 is `CollisionUtils.BOUNDING_TYPE_NONE` — nothing can collide with a bare game object. */
    // AS3: SnowWarGameObject.as::get boundingType()
    public get boundingType(): number
    {
        return 0;
    }

    /**
     * AS3 returns null from all three shape accessors and relies on `boundingType` 0 to keep the
     * collision tests from ever reading them; every collidable subclass overrides all three. The
     * port keeps `ICollidable` non-nullable rather than putting a null check on each of the forty
     * dereferences in `CollisionUtils` that AS3 does not have — so the null is cast here, at the one
     * place that produces it, instead of being spread across the arithmetic.
     */
    // AS3: SnowWarGameObject.as::get boundingData()
    public get boundingData(): number[]
    {
        return null as unknown as number[];
    }

    /** Null on the base — see `get boundingData()`. */
    // AS3: SnowWarGameObject.as::get location3D()
    public get location3D(): Location3D
    {
        return null as unknown as Location3D;
    }

    /** Null on the base — see `get boundingData()`. */
    // AS3: SnowWarGameObject.as::get direction360()
    public get direction360(): Direction360
    {
        return null as unknown as Direction360;
    }

    // AS3: SnowWarGameObject.as::get isGhost()
    public get isGhost(): boolean
    {
        return this._isGhost;
    }

    // AS3: SnowWarGameObject.as::get ghostObjectId()
    public get ghostObjectId(): number
    {
        return -(this._id + 1);
    }

    // AS3: SnowWarGameObject.as::onRemove()
    public onRemove(): void
    {
    }

    /** The first bounding number doubles as the object's height for snowball clearance. */
    // AS3: SnowWarGameObject.as::get collisionHeight()
    public get collisionHeight(): number
    {
        return this.boundingData[0];
    }

    /** A snowball flying above the object passes over it — the height test comes first, and cheap. */
    // AS3: SnowWarGameObject.as::testSnowBallCollision()
    public testSnowBallCollision(snowBall: SnowBallGameObject): boolean
    {
        return snowBall.location3D.z < this.collisionHeight
            && CollisionUtils.testForObjectToObjectCollision(this, snowBall);
    }

    // AS3: SnowWarGameObject.as::onSnowBallHit()
    public onSnowBallHit(stage: SnowWarGameStage, snowBall: SnowBallGameObject): void
    {
        void stage;
        void snowBall;
    }

    // AS3: SnowWarGameObject.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: SnowWarGameObject.as::dispose()
    public dispose(): void
    {
        this._disposed = true;
    }
}

import {Exception} from '@core/runtime/exceptions/Exception';
import {LogLevel, Logger} from '@core/utils/Logger';
import type {SnowballGameObjectData} from '@habbo/communication/messages/parser/game/snowwar/data/SnowballGameObjectData';

import type {SynchronizedGameStage} from '../arena/SynchronizedGameStage';
import type {SnowWarGameStage} from '../SnowWarGameStage';
import {Direction360} from '../utils/Direction360';
import type {Direction8} from '../utils/Direction8';
import {FastSqrt} from '../utils/FastSqrt';
import {Location3D} from '../utils/Location3D';
import {MathUtils} from '../utils/MathUtils';
import {Tile} from '../Tile';
import type {HumanGameObject} from './HumanGameObject';
import {SnowWarGameObject} from './SnowWarGameObject';

const log = Logger.getLogger('habbo.game.snowwar.gameobjects.SnowBallGameObject');

/**
 * A snowball in flight, advanced one sub-turn at a time.
 *
 * **Nothing here is real physics and none of it may become real physics.** The arc is
 * `(offset² − t²) × scale + 3000` where `t` counts down from the time-to-live — a parabola in
 * integer arithmetic, chosen so that every client draws the same one from the same throw. The three
 * trajectories differ only in how long the ball lives and how tall that parabola is; a quick throw
 * additionally clamps its height so it flies flat.
 *
 * Range decides the trajectory only for `TRAJECTORY_DEFAULT_THROW`; the other three arrive already
 * chosen by whoever threw.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/game/snowwar/gameobjects/SnowBallGameObject.as
 */
export class SnowBallGameObject extends SnowWarGameObject
{
    // AS3: SnowBallGameObject.as::TRAJECTORY_QUICK_THROW
    public static readonly TRAJECTORY_QUICK_THROW: number = 0;

    // AS3: SnowBallGameObject.as::TRAJECTORY_SHORT_LOB
    public static readonly TRAJECTORY_SHORT_LOB: number = 1;

    // AS3: SnowBallGameObject.as::TRAJECTORY_LONG_LOB
    public static readonly TRAJECTORY_LONG_LOB: number = 2;

    /** Not a trajectory of its own — a request to pick one of the other three from the range. */
    // AS3: SnowBallGameObject.as::TRAJECTORY_DEFAULT_THROW
    public static readonly TRAJECTORY_DEFAULT_THROW: number = 3;

    // AS3: SnowBallGameObject.as::THROW_VELOCITY
    public static readonly THROW_VELOCITY: number = 2000;

    // AS3: SnowBallGameObject.as::INITIAL_HEIGHT
    public static readonly INITIAL_HEIGHT: number = 3000;

    /** Derived name — `_SafeStr_10680`, named by symmetry with the short-lob coefficient below. */
    // AS3: SnowBallGameObject.as::_SafeStr_10680
    public static readonly LONG_LOB_TIME_TO_TARGET_COEF: number = 0.0007072135785007072;

    // AS3: SnowBallGameObject.as::SHORT_LOB_TIME_TO_TARGET_COEF
    public static readonly SHORT_LOB_TIME_TO_TARGET_COEF: number = 0.000559;

    // AS3: SnowBallGameObject.as::QUICK_THROW_MAX_RANGE
    public static readonly QUICK_THROW_MAX_RANGE: number = 20000;

    // AS3: SnowBallGameObject.as::SHORT_LOB_MAX_RANGE
    public static readonly SHORT_LOB_MAX_RANGE: number = 60000;

    // AS3: SnowBallGameObject.as::LONG_LOB_MAX_RANGE
    public static readonly LONG_LOB_MAX_RANGE: number = 100000;

    // AS3: SnowBallGameObject.as::DEFAULT_THROW_TO_LOB_CUTOFF_RANGE
    public static readonly DEFAULT_THROW_TO_LOB_CUTOFF_RANGE: number = 42000;

    /** Derived name — `_SafeStr_10871`, named by symmetry with the short-lob factor below. */
    // AS3: SnowBallGameObject.as::_SafeStr_10871
    public static readonly QUICK_THROW_HEIGHT_SCALING_FACTOR: number = 10;

    // AS3: SnowBallGameObject.as::SHORT_LOB_HEIGHT_SCALING_FACTOR
    public static readonly SHORT_LOB_HEIGHT_SCALING_FACTOR: number = 25;

    /** Derived name — `_SafeStr_11278`, named by symmetry with the short-lob factor above. */
    // AS3: SnowBallGameObject.as::_SafeStr_11278
    public static readonly LONG_LOB_HEIGHT_SCALING_FACTOR: number = 50;

    /**
     * Derived name — `_SafeStr_10985`. It is 3, the same as `TRAJECTORY_DEFAULT_THROW`, and nothing
     * in any tree reads it; the name says what the value counts and no more.
     */
    // AS3: SnowBallGameObject.as::_SafeStr_10985
    public static readonly TRAJECTORY_COUNT: number = 3;

    /** Declared in AS3 and read by nothing — the arc comes from the parabola, not from a force. */
    // AS3: SnowBallGameObject.as::GRAVITY
    public static readonly GRAVITY: number = 15;

    /** AS3 declares this a `static var`; nothing in any tree assigns to it, so the port seals it. */
    // AS3: SnowBallGameObject.as::BOUNDING_DATA
    public static readonly BOUNDING_DATA: number[] = [400];

    // AS3: SnowBallGameObject.as::_location3D
    private _location3D: Location3D | null = new Location3D(0, 0, 0);

    // AS3: SnowBallGameObject.as::_movementDirection360
    private _movementDirection360: Direction360 | null = new Direction360(0);

    /** Derived name — `_SafeStr_4807`, from variable slot 6, which the DTO calls `trajectory`. */
    // AS3: SnowBallGameObject.as::_SafeStr_4807
    private _trajectory: number = 0;

    /** Derived name — `_SafeStr_5291`, from variable slot 10, `planarVelocity` on the DTO. */
    // AS3: SnowBallGameObject.as::_SafeStr_5291
    private _planarVelocity: number = 0;

    /** Derived name — `_SafeStr_4763`, from variable slot 7, `timeToLive` on the DTO. */
    // AS3: SnowBallGameObject.as::_SafeStr_4763
    private _timeToLive: number = 0;

    /** Derived name — `_SafeStr_6040`, from the `throwingHuman` getter that reads it. */
    // AS3: SnowBallGameObject.as::_SafeStr_6040
    private _throwingHuman: HumanGameObject | null = null;

    /** Derived name — `_SafeStr_5580`, from variable slot 9, `parabolaOffset` on the DTO. */
    // AS3: SnowBallGameObject.as::_SafeStr_5580
    private _parabolaOffset: number = 0;

    // AS3: SnowBallGameObject.as::SnowBallGameObject()
    public constructor(id: number)
    {
        super(id, false);
    }

    /**
     * Adopts a snowball the server already simulated — nothing is recomputed, because the server's
     * numbers are the authority for a ball this client did not throw.
     */
    // AS3: SnowBallGameObject.as::initializeFromData()
    public initializeFromData(data: SnowballGameObjectData, thrower: HumanGameObject): void
    {
        (this._location3D as Location3D).changeLocation(data.locationX3D, data.locationY3D, data.locationZ3D);
        (this._movementDirection360 as Direction360).setIntValue(data.movementDirection360);
        this._trajectory = data.trajectory;
        this._planarVelocity = data.planarVelocity;
        this._timeToLive = data.timeToLive;
        this._throwingHuman = thrower;
        this._parabolaOffset = data.parabolaOffset;
        this._active = true;
    }

    /**
     * Throws a new ball, deriving everything from where it starts and where it is aimed.
     *
     * The `/ 200` before the square root is what keeps the distance inside the range `fast_sqrt()`
     * tabulates; the result is multiplied back out. Both divisions go through `javaDiv()` because a
     * throw towards a lower coordinate produces negatives, and `Math.floor` would round those the
     * other way from the server.
     *
     * Note the order: `initializeTrajectory()` resolves `TRAJECTORY_DEFAULT_THROW` into a real
     * trajectory *first*, and the branches below then read the resolved value.
     */
    // AS3: SnowBallGameObject.as::initialize()
    public initialize(
        x: number, y: number, z: number, trajectory: number, targetX: number, targetY: number, thrower: HumanGameObject
    ): void
    {
        this._active = true;
        (this._location3D as Location3D).changeLocation(x, y, z);
        this._trajectory = trajectory;

        let deltaX = targetX - x;
        let deltaY = targetY - y;

        deltaX = MathUtils.javaDiv(deltaX / 200);
        deltaY = MathUtils.javaDiv(deltaY / 200);
        (this._movementDirection360 as Direction360).setIntValue(Direction360.getAngleFromComponents(deltaX, deltaY));

        let range = FastSqrt.fastSqrt(deltaX * deltaX + deltaY * deltaY) * 200;

        this.initializeTrajectory(trajectory, range);

        if(this._trajectory === 0)
        {
            this._timeToLive = 20000 / 2000;
            this._planarVelocity = 2000;
        }
        else if(this._trajectory === 1)
        {
            range = Math.min(range, 60000);
            this._timeToLive = MathUtils.javaDiv(range * 0.000559);
            this._planarVelocity = this._timeToLive === 0 ? 0 : MathUtils.javaDiv(range / this._timeToLive);
        }
        else if(this._trajectory === 2)
        {
            range = Math.min(range, 100000);
            this._timeToLive = MathUtils.javaDiv(range * 0.0007072135785007072);
            this._planarVelocity = this._timeToLive === 0 ? 0 : MathUtils.javaDiv(range / this._timeToLive);
        }

        this._parabolaOffset = MathUtils.javaDiv(this._timeToLive / 2);
        this._throwingHuman = thrower;

        if(log.isEnabled(LogLevel.TRACE))
        {
            const root = FastSqrt.fastSqrt(deltaX * deltaX + deltaY * deltaY);

            log.trace(
                `Snowball created, id=${this._id} ttl:${this._timeToLive} deltaX:${deltaX} deltaY:${deltaY}`
                + ` deltaX/200:${MathUtils.javaDiv(deltaX / 200)} deltaY/200:${MathUtils.javaDiv(deltaY / 200)}`
                + ` deltax^2+deltay^2:${deltaX * deltaX + deltaY * deltaY}`
                + ` sqrt(deltax^2+deltay^2):${root} sqrt(deltax^2+deltay^2)*200:${root * 200}`
            );
        }
    }

    /** Only `TRAJECTORY_DEFAULT_THROW` looks at the range; anything else is taken as given. */
    // AS3: SnowBallGameObject.as::initializeTrajectory()
    private initializeTrajectory(trajectory: number, range: number): void
    {
        if(trajectory === 3)
        {
            if(range <= 42000)
            {
                this._trajectory = 0;
            }
            else if(range <= 60000)
            {
                this._trajectory = 1;
            }
            else
            {
                this._trajectory = 2;
            }
        }
        else
        {
            this._trajectory = trajectory;
        }
    }

    // AS3: SnowBallGameObject.as::get numberOfVariables()
    public override get numberOfVariables(): number
    {
        return 11;
    }

    /** The eleven slots mirror `SnowballGameObjectData`'s wire order exactly. */
    // AS3: SnowBallGameObject.as::getVariable()
    public override getVariable(index: number): number
    {
        switch(index)
        {
            case 0:
                return 1;
            case 1:
                return this._id;
            case 2:
                return (this._location3D as Location3D).x;
            case 3:
                return (this._location3D as Location3D).y;
            case 4:
                return (this._location3D as Location3D).z;
            case 5:
                return (this._movementDirection360 as Direction360).intValue();
            case 6:
                return this._trajectory;
            case 7:
                return this._timeToLive;
            // A ball with no thrower contributes 0, which is what AS3's `int` coercion of the
            // null-conditional read produces.
            case 8:
                return this._throwingHuman?.gameObjectId ?? 0;
            case 9:
                return this._parabolaOffset;
            case 10:
                return this._planarVelocity;
            default:
                throw new Exception(`No such variable:${index}`);
        }
    }

    // AS3: SnowBallGameObject.as::get direction360()
    public override get direction360(): Direction360
    {
        return this._movementDirection360 as Direction360;
    }

    /** 2 is `CollisionUtils.BOUNDING_TYPE_CIRCLE`. */
    // AS3: SnowBallGameObject.as::get boundingType()
    public override get boundingType(): number
    {
        return 2;
    }

    // AS3: SnowBallGameObject.as::get boundingData()
    public override get boundingData(): number[]
    {
        return SnowBallGameObject.BOUNDING_DATA;
    }

    // AS3: SnowBallGameObject.as::get location3D()
    public override get location3D(): Location3D
    {
        return this._location3D as Location3D;
    }

    /**
     * Advance, then look for something to hit. The ground check is last and only runs if nothing
     * else was struck, which is why a miss makes a sound and a hit does not — the hit's own sound
     * comes from whatever was hit.
     */
    // AS3: SnowBallGameObject.as::subturn()
    public override subturn(stage: SynchronizedGameStage): void
    {
        const snowWarStage = stage as SnowWarGameStage;

        if(!this._active)
        {
            return;
        }

        this._timeToLive = this._timeToLive - 1;

        if(this._trajectory === 0)
        {
            this.updatePosition(10, true);
        }
        else if(this._trajectory === 1)
        {
            this.updatePosition(25, false);
        }
        else
        {
            this.updatePosition(50, false);
        }

        const tileX = Tile.convertToTileX(this.location3D.x);
        const tileY = Tile.convertToTileY(this.location3D.y);
        const tile = snowWarStage.getTileAt(tileX, tileY);
        let collided = this.testCollisions(snowWarStage, tile);

        if(!collided)
        {
            collided = snowWarStage.testCollisionWithGround(this);

            if(collided)
            {
                // TODO(AS3): sources/WIN63-202607011411-782849652/src/com/sulake/habbo/game/snowwar/SnowWarEngine.as::playSound()
                //   AS3 plays "HBSTG_snowwar_miss" here. SnowWarEngine is unported.
                log.trace('Snowball missed (sound HBSTG_snowwar_miss not played: SnowWarEngine unported)');
            }
        }

        if(collided)
        {
            snowWarStage.putGameObjectOnDeleteList(this);
        }

        if(log.isEnabled(LogLevel.TRACE))
        {
            log.trace(`Snowball ${this._id} tileX:${tileX} tileY:${tileY} collision:${collided}`);
        }
    }

    /**
     * Four tiles, cheapest first: the one the ball is over, then the one ahead of it, then the two
     * either side at 45°. A ball moving fast enough to cross more than one tile in a sub-turn can
     * still pass through something — that is the model, and both sides of the wire share it.
     */
    // AS3: SnowBallGameObject.as::testCollisions()
    private testCollisions(stage: SnowWarGameStage, tile: Tile | null): boolean
    {
        let collided = false;

        if(tile)
        {
            collided = this.testCollision(stage, tile);

            if(!collided)
            {
                const heading = (this._movementDirection360 as Direction360).direction8Value() as Direction8;

                collided = this.testCollision(stage, tile.getTileInDirection(heading));

                if(!collided)
                {
                    collided = this.testCollision(stage, tile.getTileInDirection(heading.rotateDirection45Degrees(false)));

                    if(!collided)
                    {
                        collided = this.testCollision(stage, tile.getTileInDirection(heading.rotateDirection45Degrees(true)));
                    }
                }
            }
        }

        return collided;
    }

    // AS3: SnowBallGameObject.as::testCollision()
    private testCollision(stage: SnowWarGameStage, tile: Tile | null): boolean
    {
        if(tile)
        {
            const occupant = tile.gameObject;

            if(occupant)
            {
                if(log.isEnabled(LogLevel.TRACE))
                {
                    log.trace(`Snowball ${this._id} testing collision with ${occupant.gameObjectId}`);
                }

                if(occupant.testSnowBallCollision(this))
                {
                    occupant.onSnowBallHit(stage, this);

                    return true;
                }
            }
        }

        return false;
    }

    /**
     * One step along the heading, plus the parabola's height for the current time-to-live.
     *
     * **The divisor is 255 here and 256 in `CollisionUtils`** — the base vectors are scaled by 256,
     * so this is off by one against the collision code. It is in every tree and the server does the
     * same thing, so it is wire behaviour, not a typo to correct.
     */
    // AS3: SnowBallGameObject.as::updatePosition()
    private updatePosition(heightScalingFactor: number, clampToInitialHeight: boolean): void
    {
        const direction = this._movementDirection360 as Direction360;
        const location = this._location3D as Location3D;

        const x = location.x + MathUtils.javaDiv(direction.getBaseVectorXComponent() * this._planarVelocity / 255);
        const y = location.y + MathUtils.javaDiv(direction.getBaseVectorYComponent() * this._planarVelocity / 255);
        const t = this._timeToLive - this._parabolaOffset;
        let z = (this._parabolaOffset * this._parabolaOffset - t * t) * heightScalingFactor + 3000;

        if(clampToInitialHeight)
        {
            z = Math.min(z, 3000);
        }

        location.changeLocation(x, y, z);
    }

    /** Snowballs pass through each other. */
    // AS3: SnowBallGameObject.as::onSnowBallHit()
    public override onSnowBallHit(stage: SnowWarGameStage, snowBall: SnowBallGameObject): void
    {
        void stage;
        void snowBall;
    }

    // AS3: SnowBallGameObject.as::toString()
    public toString(): string
    {
        const location = this._location3D as Location3D;

        return ` location=(${location.x},${location.y},${location.z})`
            + ` dir=${String(this._movementDirection360)} paraOffs=${this._parabolaOffset} ttl=${this._timeToLive}`;
    }

    // AS3: SnowBallGameObject.as::get throwingHuman()
    public get throwingHuman(): HumanGameObject | null
    {
        return this._throwingHuman;
    }

    // AS3: SnowBallGameObject.as::dispose()
    public override dispose(): void
    {
        super.dispose();

        this._location3D?.dispose();
        this._location3D = null;
        this._movementDirection360?.dispose();
        this._movementDirection360 = null;
        this._trajectory = 0;
        this._planarVelocity = 0;
        this._timeToLive = 0;
        this._throwingHuman = null;
        this._parabolaOffset = 0;
    }
}

import {Exception} from '@core/runtime/exceptions/Exception';
import {LogLevel, Logger} from '@core/utils/Logger';
import {OrderedMap} from '@core/utils/OrderedMap';
import type {HumanGameObjectData} from '@habbo/communication/messages/parser/game/snowwar/data/HumanGameObjectData';

import type {SynchronizedGameArena} from '../arena/SynchronizedGameArena';
import type {SynchronizedGameStage} from '../arena/SynchronizedGameStage';
import type {SnowWarArenaExtension} from '../SnowWarArenaExtension';
import {SnowWarEngine} from '../SnowWarEngine';
import type {SnowWarGameStage} from '../SnowWarGameStage';
import {Direction360} from '../utils/Direction360';
import {Direction8} from '../utils/Direction8';
import {Location3D} from '../utils/Location3D';
import {MathUtils} from '../utils/MathUtils';
import {Tile} from '../Tile';
import type {SnowBallGameObject} from './SnowBallGameObject';
import {SnowWarGameObject} from './SnowWarGameObject';

const log = Logger.getLogger('habbo.game.snowwar.gameobjects.HumanGameObject');

/**
 * A player, or a bot, in the arena.
 *
 * **Movement is tile-to-tile at a fixed step of 534 units per sub-turn**, never free-floating: a
 * player always has a current tile, and while crossing a boundary also a next tile, holding both
 * until the remaining distance drops below half a step. Both tiles are marked occupied for that
 * time, which is why `onRemove()` has to release two of them.
 *
 * The activity state is the whole behaviour model — normal, making a snowball, stunned, invincible —
 * and `_activityTimer` counting down to 1 is what ends each of them. Nothing here is driven by
 * elapsed time.
 *
 * A **ghost** is this client's prediction of its own player, one turn ahead of the server. It keeps
 * a per-turn history of where it thought it was (`addGhostLocation()`), which is how the reconcile
 * decides whether the prediction was close enough to keep.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/game/snowwar/gameobjects/HumanGameObject.as
 */
export class HumanGameObject extends SnowWarGameObject
{
    /**
     * Derived name — `_SafeStr_11451`, obfuscated in every tree. It is the distance a player covers
     * in one sub-turn, and AS3 writes the literal 534 at each of its six uses rather than reading
     * the constant.
     */
    // AS3: HumanGameObject.as::_SafeStr_11451
    public static readonly MOVEMENT_STEP: number = 534;

    // AS3: HumanGameObject.as::INITIAL_SNOWBALL_COUNT
    public static readonly INITIAL_SNOWBALL_COUNT: number = 5;

    // AS3: HumanGameObject.as::MAXIMUM_SNOWBALL_COUNT
    public static readonly MAXIMUM_SNOWBALL_COUNT: number = 5;

    // AS3: HumanGameObject.as::INITIAL_HIT_POINTS
    public static readonly INITIAL_HIT_POINTS: number = 5;

    // AS3: HumanGameObject.as::SNOWBALL_CREATE_TIME
    public static readonly SNOWBALL_CREATE_TIME: number = 20;

    // AS3: HumanGameObject.as::STUN_TIME
    public static readonly STUN_TIME: number = 100;

    // AS3: HumanGameObject.as::INVINCIBLE_AFTER_STUN_TIME
    public static readonly INVINCIBLE_AFTER_STUN_TIME: number = 60;

    // AS3: HumanGameObject.as::ACTIVITY_STATE_NORMAL
    public static readonly ACTIVITY_STATE_NORMAL: number = 0;

    // AS3: HumanGameObject.as::ACTIVITY_STATE_MAKING_SNOWBALL
    public static readonly ACTIVITY_STATE_MAKING_SNOWBALL: number = 1;

    // AS3: HumanGameObject.as::ACTIVITY_STATE_STUNNED
    public static readonly ACTIVITY_STATE_STUNNED: number = 2;

    // AS3: HumanGameObject.as::ACTIVITY_STATE_INVINCIBLE_AFTER_STUN
    public static readonly ACTIVITY_STATE_INVINCIBLE_AFTER_STUN: number = 3;

    // AS3: HumanGameObject.as::SNOWBALL_THROW_INTERVAL
    public static readonly SNOWBALL_THROW_INTERVAL: number = 5;

    // AS3: HumanGameObject.as::PLAYER_HEIGHT
    public static readonly PLAYER_HEIGHT: number = 5000;

    // AS3: HumanGameObject.as::SCORE_ON_KNOCK_DOWN
    private static readonly SCORE_ON_KNOCK_DOWN: number = 5;

    // AS3: HumanGameObject.as::SCORE_ON_HIT
    private static readonly SCORE_ON_HIT: number = 1;

    // AS3: HumanGameObject.as::BOUNDING_DATA
    public static readonly BOUNDING_DATA: number[] = [1600];

    /** Name recovered from the 2016 tree — `_SafeStr_4647` in the primary. */
    // AS3: HumanGameObject.as::_SafeStr_4647
    private _currentTile: Tile | null = null;

    /** Name recovered from the 2016 tree — `_SafeStr_4579` in the primary. */
    // AS3: HumanGameObject.as::_SafeStr_4579
    private _nextTile: Tile | null = null;

    /** Derived name — `_SafeStr_4931`; it is what `posture` reads to answer "swrun". */
    // AS3: HumanGameObject.as::_SafeStr_4931
    private _isMoving: boolean = false;

    /** Name recovered from the 2016 tree — `_SafeStr_4671` in the primary. */
    // AS3: HumanGameObject.as::_SafeStr_4671
    private _currentLocation: Location3D | null = new Location3D(0, 0, 0);

    /** Name recovered from the 2016 tree — `_SafeStr_4852` in the primary. */
    // AS3: HumanGameObject.as::_SafeStr_4852
    private _moveTarget: Location3D | null = new Location3D(0, 0, 0);

    /**
     * Name recovered from the 2016 tree, where it is `_stoppedDir` — `_SafeStr_5201` in the primary.
     * The 2026 accessors call it the body direction (`setBodyDirection`/`getBodyDirection`); the
     * field keeps the name it actually has.
     */
    // AS3: HumanGameObject.as::_SafeStr_5201
    private _stoppedDir: Direction8 | null = Direction8.SE;

    // AS3: HumanGameObject.as::_hitPoints
    private _hitPoints: number = 0;

    /** Derived name — `_SafeStr_4779`, from the `snowballs` getter that reads it. */
    // AS3: HumanGameObject.as::_SafeStr_4779
    private _snowballCount: number = 0;

    /**
     * Derived name — `_SafeStr_8673`, from variable slot 9, which the DTO calls `isBot`. Protected
     * and never written in this class: no bot subclass exists in this build, so it stays 0.
     */
    // AS3: HumanGameObject.as::_SafeStr_8673
    protected _isBot: number = 0;

    /** Derived name — `_SafeStr_4848`, from variable slot 10, `activityTimer` on the DTO. */
    // AS3: HumanGameObject.as::_SafeStr_4848
    private _activityTimer: number = 0;

    /** Derived name — `_SafeStr_4627`, from variable slot 11, `activityState` on the DTO. */
    // AS3: HumanGameObject.as::_SafeStr_4627
    private _activityState: number = 0;

    /** Name recovered from the 2016 tree — `_SafeStr_5404` in the primary. */
    // AS3: HumanGameObject.as::_SafeStr_5404
    private _score: number = 0;

    /** Name recovered from the 2016 tree — `_SafeStr_5848` in the primary. */
    // AS3: HumanGameObject.as::_SafeStr_5848
    private _team: number = 0;

    /** Derived name — `_SafeStr_5855`; `startThrowTimer()` sets it and `posture` reads it. */
    // AS3: HumanGameObject.as::_SafeStr_5855
    private _throwTimer: number = 0;

    // AS3: HumanGameObject.as::_name
    private _name: string = '';

    /** Name recovered from the 2016 tree — `_SafeStr_7742` in the primary. */
    // AS3: HumanGameObject.as::_SafeStr_7742
    private _mission: string = '';

    /** Name recovered from the 2016 tree — `_SafeStr_5551` in the primary. */
    // AS3: HumanGameObject.as::_SafeStr_5551
    private _figure: string = '';

    /** Name recovered from the 2016 tree — `_SafeStr_5898` in the primary. */
    // AS3: HumanGameObject.as::_SafeStr_5898
    private _sex: string = '';

    /** Name recovered from the 2016 tree — `_SafeStr_5971` in the primary. */
    // AS3: HumanGameObject.as::_SafeStr_5971
    private _userId: number = 0;

    // AS3: HumanGameObject.as::_visualizationMode
    private _visualizationMode: number = 0;

    /** Name recovered from the 2016 tree — `_SafeStr_4581` in the primary. */
    // AS3: HumanGameObject.as::_SafeStr_4581
    private _snowWarEngine: SnowWarEngine | null = null;

    /** Derived name — `_SafeStr_6577`; keyed by turn number, holding where the ghost thought it was. */
    // AS3: HumanGameObject.as::_SafeStr_6577
    private _ghostLocations: OrderedMap<number, Location3D> | null = null;

    /**
     * A player who arrives mid-stride occupies **both** tiles, and the current one has its human
     * released — `nextTile` is the one that holds them until they arrive.
     */
    // AS3: HumanGameObject.as::HumanGameObject()
    public constructor(
        stage: SnowWarGameStage,
        data: HumanGameObjectData,
        isGhost: boolean,
        snowWarEngine: SnowWarEngine | null
    )
    {
        super(data.id, isGhost);

        this._sex = data.sex;
        this._name = data.name;
        this._mission = data.mission;
        this._figure = data.figure;
        this._team = data.team;
        this._userId = data.userId;
        this._activityState = data.activityState;
        this._activityTimer = data.activityTimer;
        (this._currentLocation as Location3D).change2DLocation(data.currentLocationX, data.currentLocationY);
        this._stoppedDir = Direction8.requireDirection8(Direction8.getDirection8(data.bodyDirection));
        this._hitPoints = data.hitPoints;
        (this._moveTarget as Location3D).change2DLocation(data.moveTargetX, data.moveTargetY);
        this._snowballCount = data.snowBallCount;
        this._score = data.score;
        this._currentTile = stage.getTileAt(data.currentTileX, data.currentTileY);
        (this._currentTile as Tile).addGameObject(this);

        const nextTile = stage.getTileAt(data.nextTileX, data.nextTileY);

        if(nextTile !== this._currentTile)
        {
            this._nextTile = nextTile;
            (this._nextTile as Tile).addGameObject(this);
            (this._currentTile as Tile).removeOccupyingHuman();
            this._isMoving = true;
        }

        this._snowWarEngine = snowWarEngine;
        this._ghostLocations = new OrderedMap<number, Location3D>();
    }

    // AS3: HumanGameObject.as::get visualizationMode()
    public get visualizationMode(): number
    {
        return this._visualizationMode;
    }

    // AS3: HumanGameObject.as::set visualizationMode()
    public set visualizationMode(mode: number)
    {
        this._visualizationMode = mode;
    }

    // AS3: HumanGameObject.as::get invincible()
    public get invincible(): boolean
    {
        return this._activityState === 3;
    }

    // AS3: HumanGameObject.as::get numberOfVariables()
    public override get numberOfVariables(): number
    {
        return 19;
    }

    /**
     * The nineteen slots mirror `HumanGameObjectData`'s wire order exactly.
     *
     * Slots 12 and 13 answer the *current* tile when there is no next one, so a stationary player
     * still reports a next tile — the server reads them the same way.
     */
    // AS3: HumanGameObject.as::getVariable()
    public override getVariable(index: number): number
    {
        const currentTile = this._currentTile as Tile;

        switch(index)
        {
            case 0:
                return 5;
            case 1:
                return this._id;
            case 2:
                return (this._currentLocation as Location3D).x;
            case 3:
                return (this._currentLocation as Location3D).y;
            case 4:
                return currentTile.fuseLocation[0];
            case 5:
                return currentTile.fuseLocation[1];
            case 6:
                return (this._stoppedDir as Direction8).intValue();
            case 7:
                return this._hitPoints;
            case 8:
                return this._snowballCount;
            case 9:
                return this._isBot;
            case 10:
                return this._activityTimer;
            case 11:
                return this._activityState;
            case 12:
                return this._nextTile !== null ? this._nextTile.fuseLocation[0] : currentTile.fuseLocation[0];
            case 13:
                return this._nextTile !== null ? this._nextTile.fuseLocation[1] : currentTile.fuseLocation[1];
            case 14:
                return (this._moveTarget as Location3D).x;
            case 15:
                return (this._moveTarget as Location3D).y;
            case 16:
                return this._score;
            case 17:
                return this._team;
            case 18:
                return this._userId;
            default:
                throw new Exception(`No such variable:${index}`);
        }
    }

    /**
     * Copies a real player's state onto this ghost so the prediction restarts from the server's
     * last word. The two `Location3D`s are copied by value; the tiles by reference, because the
     * ghost walks the same map.
     */
    // AS3: HumanGameObject.as::reinitGhost()
    public reinitGhost(source: HumanGameObject): void
    {
        (this._currentLocation as Location3D).change2DLocation(
            (source._currentLocation as Location3D).x, (source._currentLocation as Location3D).y
        );
        this._currentTile = source._currentTile;
        this._stoppedDir = source._stoppedDir;
        this._hitPoints = source._hitPoints;
        this._snowballCount = source._snowballCount;
        this._isBot = source._isBot;
        this._activityTimer = source._activityTimer;
        this._activityState = source._activityState;
        this._nextTile = source._nextTile;
        (this._moveTarget as Location3D).change2DLocation(
            (source._moveTarget as Location3D).x, (source._moveTarget as Location3D).y
        );
        this._score = source._score;
        this._team = source._team;
        this._userId = source._userId;
    }

    /** A turn with no recorded ghost location answers false — there is nothing to compare against. */
    // AS3: HumanGameObject.as::isInGhostDistance()
    public isInGhostDistance(turn: number, location: Location3D): boolean
    {
        const ghostLocation = this._ghostLocations?.getValue(turn) ?? null;

        if(ghostLocation)
        {
            return ghostLocation.isInDistance(location, Tile.TILE_ONEANDHALFWIDTH);
        }

        return false;
    }

    // AS3: HumanGameObject.as::addGhostLocation()
    public addGhostLocation(turn: number): void
    {
        const location = new Location3D(0, 0, 0);

        location.change2DLocation((this._currentLocation as Location3D).x, (this._currentLocation as Location3D).y);
        this._ghostLocations?.setValue(turn, location);
    }

    // AS3: HumanGameObject.as::removeGhostLocation()
    public removeGhostLocation(turn: number): void
    {
        this._ghostLocations?.remove(turn);
    }

    // AS3: HumanGameObject.as::setBodyDirection()
    public setBodyDirection(direction: Direction8): void
    {
        this._stoppedDir = direction;
    }

    /** 2 is `CollisionUtils.BOUNDING_TYPE_CIRCLE`. */
    // AS3: HumanGameObject.as::get boundingType()
    public override get boundingType(): number
    {
        return 2;
    }

    // AS3: HumanGameObject.as::get boundingData()
    public override get boundingData(): number[]
    {
        return HumanGameObject.BOUNDING_DATA;
    }

    // AS3: HumanGameObject.as::get location3D()
    public override get location3D(): Location3D
    {
        return this._currentLocation as Location3D;
    }

    /** Null even though a player has a body direction — the circle test never asks for one. */
    // AS3: HumanGameObject.as::get direction360()
    public override get direction360(): Direction360
    {
        return null as unknown as Direction360;
    }

    /** Releases both tiles, and only the ones this player actually holds. */
    // AS3: HumanGameObject.as::onRemove()
    public override onRemove(): void
    {
        if(this._currentTile && this._currentTile.occupyingHuman === this)
        {
            this._currentTile.removeOccupyingHuman();
        }

        if(this._nextTile && this._nextTile.occupyingHuman === this)
        {
            this._nextTile.removeOccupyingHuman();
        }

        this._isMoving = false;
    }

    /**
     * The end of whatever the player was doing.
     *
     * Getting up from a stun is the one branch that does not return to normal: it refills hit points
     * and moves to the invincible state with its own timer, which is what stops a downed player from
     * being immediately downed again.
     */
    // AS3: HumanGameObject.as::activityTimerTriggered()
    public activityTimerTriggered(): void
    {
        if(this._activityState === 2)
        {
            this._hitPoints = 5;
            this._activityState = 3;
            this._activityTimer = 60;

            return;
        }

        if(this._activityState === 1)
        {
            this._snowballCount = this._snowballCount + 1;
        }

        this._activityState = 0;
        this.stopWaitingForSnowball();
    }

    /**
     * One sub-turn of movement.
     *
     * With a next tile the player simply walks towards it. Without one, and with the target out of
     * range of the current tile, it picks the direction of the target and tries three tiles in
     * order: straight on, then one step anticlockwise, then two steps clockwise from there. If none
     * is free the player stops.
     *
     * The early return in the middle is AS3's: walking into the tile the target sits on, when that
     * tile is blocked, ends the walk rather than trying the neighbours.
     */
    // AS3: HumanGameObject.as::subturn()
    public override subturn(stage: SynchronizedGameStage): void
    {
        void stage;

        if(this._activityTimer > 0)
        {
            if(this._activityTimer === 1)
            {
                this.activityTimerTriggered();
            }

            this._activityTimer = this._activityTimer - 1;
        }

        if(this._throwTimer > 0)
        {
            this._throwTimer = this._throwTimer - 1;
        }

        if(log.isEnabled(LogLevel.TRACE))
        {
            log.trace(`${this.gameObjectId} currentTile:${String(this._currentTile)} nextTile:${String(this._nextTile)}`);
        }

        if(!this.canMove() || this._currentTile === null)
        {
            this._isMoving = false;

            return;
        }

        if(this._nextTile !== null)
        {
            if(log.isEnabled(LogLevel.TRACE))
            {
                log.trace(
                    `${this.gameObjectId} Moving towards next tile:${String(this._nextTile)}`
                    + ` _currentLocation:${String(this._currentLocation)}`
                );
            }

            this.moveTowardsNextTile();

            return;
        }

        if(this._currentTile.locationIsInTileRange(this._moveTarget as Location3D))
        {
            this._isMoving = false;

            return;
        }

        const angle = Direction360.getAngleFromComponents(
            (this._moveTarget as Location3D).x - this._currentTile.location.x,
            (this._moveTarget as Location3D).y - this._currentTile.location.y
        );
        let direction = Direction8.requireDirection8(Direction360.direction360ValueToDirection8(angle));

        this._nextTile = this._currentTile.getTileInDirection(direction);

        if(this._nextTile === null || !this._nextTile.canMoveTo(this))
        {
            if(this._nextTile !== null && !this._nextTile.canMoveTo(this))
            {
                if((this._moveTarget as Location3D).equals(this._nextTile.location))
                {
                    this._nextTile = null;
                    this.stopMovement();

                    return;
                }
            }

            direction = direction.rotateDirection(-1);
            this._nextTile = this._currentTile.getTileInDirection(direction);

            if(this._nextTile === null || !this._nextTile.canMoveTo(this))
            {
                direction = direction.rotateDirection(2);
                this._nextTile = this._currentTile.getTileInDirection(direction);

                if(this._nextTile !== null && !this._nextTile.canMoveTo(this))
                {
                    this._nextTile = null;
                }
            }
        }

        if(this._nextTile !== null)
        {
            // A ghost does not touch tile occupancy: it is a prediction of a player who is already
            // standing somewhere, and claiming tiles for it would block the real one.
            if(!this.isGhost)
            {
                this._currentTile.removeOccupyingHuman();
                this._nextTile.addGameObject(this);
            }

            this.setBodyDirection(direction);
            this.moveTowardsNextTile();
        }
        else
        {
            this._isMoving = false;
        }

        if(log.isEnabled(LogLevel.TRACE))
        {
            log.trace(
                `${this.gameObjectId} Starting to move to next tile in direction360:${angle},`
                + ` nextTile is now ${String(this._nextTile)}_currentLocationn:${String(this._currentLocation)},`
                + ` moveTarget:${String(this._moveTarget)}`
            );
        }
    }

    /**
     * One 534-unit step on each axis independently, snapping to the target coordinate when the
     * remainder is smaller than a step. Arrival is declared when the remaining distance drops below
     * half a step, at which point the next tile becomes the current one.
     */
    // AS3: HumanGameObject.as::moveTowardsNextTile()
    private moveTowardsNextTile(): void
    {
        const nextTile = this._nextTile as Tile;
        const location = this._currentLocation as Location3D;

        if(log.isEnabled(LogLevel.TRACE))
        {
            log.trace(`${this.gameObjectId} [MoveTowardsNextTile], currentX: ${location.x} currentY: ${location.y}`);
        }

        const targetX = nextTile.location.x;
        let x = location.x;
        const dx = x - targetX;

        if(dx !== 0)
        {
            if(dx < 0)
            {
                if(dx > -534)
                {
                    x = targetX;
                }
                else
                {
                    x += 534;
                }
            }
            else if(dx < 534)
            {
                x = targetX;
            }
            else
            {
                x -= 534;
            }
        }

        const targetY = nextTile.location.y;
        let y = location.y;
        const dy = y - targetY;

        if(dy !== 0)
        {
            if(dy < 0)
            {
                if(dy > -534)
                {
                    y = targetY;
                }
                else
                {
                    y += 534;
                }
            }
            else if(dy < 534)
            {
                y = targetY;
            }
            else
            {
                y -= 534;
            }
        }

        if(log.isEnabled(LogLevel.TRACE))
        {
            log.trace(`${this.gameObjectId} [MoveTowardsNextTile], nextX: ${x} nextY: ${y}`);
        }

        location.change2DLocation(x, y);

        if(location.distanceTo(nextTile.location) < MathUtils.javaDiv(534 / 2))
        {
            this._currentTile = this._nextTile;
            this._nextTile = null;
        }

        this._isMoving = true;
    }

    /**
     * Retargets the walk. Making a snowball is cancelled outright; being stunned is not — a stunned
     * player's target is left alone until they get up.
     */
    // AS3: HumanGameObject.as::changeMoveTarget()
    public changeMoveTarget(x: number, y: number): void
    {
        if(this._activityState === 1)
        {
            this._activityState = 0;
            this._activityTimer = 0;
            this.stopWaitingForSnowball();
        }

        if(this._activityState === 0 || this._activityState === 3)
        {
            (this._moveTarget as Location3D).change2DLocation(x, y);
        }
    }

    // AS3: HumanGameObject.as::get currentLocation()
    public get currentLocation(): Location3D
    {
        return this._currentLocation as Location3D;
    }

    /**
     * Takes a hit. Ghosts never take damage — the real object does, and the ghost is re-synced from
     * it — and friendly fire is dropped by team before hit points are touched.
     *
     * The knock-down runs on the hit that brings the player to **one** point, before the decrement,
     * so the fall and the last point are the same event.
     */
    // AS3: HumanGameObject.as::playerIsHitBySnowball()
    public playerIsHitBySnowball(stage: SnowWarGameStage, thrower: HumanGameObject, direction360: number): void
    {
        if(this._isGhost)
        {
            return;
        }

        if(this._team === thrower.team)
        {
            return;
        }

        if(this._hitPoints > 0)
        {
            if(this._hitPoints === 1)
            {
                this.playerFallsDown(direction360);
                thrower.onKnockDownHuman(stage, this);

                // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/game/snowwar/SnowWarEngine.as::playSound()
                SnowWarEngine.playSound('HBSTG_snowwar_hit3');
            }

            this._hitPoints = this._hitPoints - 1;

            // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/game/snowwar/SnowWarEngine.as::registerHit()
            this._snowWarEngine?.registerHit(this, thrower);
        }
    }

    /** A hit on an opponent scores — or on anyone at all in a death match. */
    // AS3: HumanGameObject.as::onHitHuman()
    public onHitHuman(stage: SnowWarGameStage, victim: HumanGameObject): void
    {
        const extension = stage.gameArena?.getExtension() as SnowWarArenaExtension | null;

        if(!victim.isGhost && (this.team !== victim.team || Boolean(extension?.isDeathMatch())))
        {
            this.addScore(stage.gameArena as SynchronizedGameArena, 1);
        }
    }

    // AS3: HumanGameObject.as::onKnockDownHuman()
    public onKnockDownHuman(stage: SnowWarGameStage, victim: HumanGameObject): void
    {
        const extension = stage.gameArena?.getExtension() as SnowWarArenaExtension | null;

        if(!victim.isGhost && (this.team !== victim.team || Boolean(extension?.isDeathMatch())))
        {
            this.addScore(stage.gameArena as SynchronizedGameArena, 5);
        }
    }

    /** Scores twice: once for the player, once for their team. */
    // AS3: HumanGameObject.as::addScore()
    public addScore(gameArena: SynchronizedGameArena, score: number): void
    {
        this._score += score;
        gameArena.addTeamScore(this.team, score);
    }

    /** Falls facing away from the throw — the direction is reversed, not copied. */
    // AS3: HumanGameObject.as::playerFallsDown()
    public playerFallsDown(direction360: number): void
    {
        this._activityState = 2;
        this._activityTimer = 100;
        this.setBodyDirection(
            Direction8.requireDirection8(Direction360.direction360ValueToDirection8(direction360)).oppositeDirection()
        );
        this.stopMovement();
        this.stopWaitingForSnowball();
    }

    /**
     * Stops where the player *is*, not where they were: mid-stride they are snapped forward onto the
     * tile they were entering, so they never end a walk standing between two squares.
     */
    // AS3: HumanGameObject.as::stopMovement()
    public stopMovement(): void
    {
        if(this._nextTile === null)
        {
            (this._moveTarget as Location3D).changeLocationToLocation((this._currentTile as Tile).location);
            (this._currentLocation as Location3D).changeLocationToLocation((this._currentTile as Tile).location);
        }
        else
        {
            this._currentTile = this._nextTile;
            (this._currentLocation as Location3D).changeLocationToLocation(this._nextTile.location);
            (this._moveTarget as Location3D).changeLocationToLocation(this._nextTile.location);
            this._nextTile = null;
        }

        this._isMoving = false;

        if(log.isEnabled(LogLevel.TRACE))
        {
            log.trace(
                `Stopped. dir:${String(this._stoppedDir)}_currentTilee:${String(this._currentTile)}`
                + `_nextTilee:${String(this._nextTile)}_currentLocationn:${String(this._currentLocation)}`
                + `_moveTargett:${String(this._moveTarget)}`
            );
        }
    }

    // AS3: HumanGameObject.as::getBodyDirection()
    public getBodyDirection(): number
    {
        return (this._stoppedDir as Direction8).intValue();
    }

    // AS3: HumanGameObject.as::canThrowSnowballs()
    public canThrowSnowballs(): boolean
    {
        return this._snowballCount > 0 && this._throwTimer < 1 && (this._activityState === 0 || this._activityState === 3);
    }

    // AS3: HumanGameObject.as::startThrowTimer()
    public startThrowTimer(): void
    {
        this._throwTimer = 5;
    }

    /**
     * Turns to face the target, spends a snowball and answers whether the throw happened. It does
     * **not** create the ball — that is a separate event, and this only prepares the thrower.
     */
    // AS3: HumanGameObject.as::throwSnowball()
    public throwSnowball(targetX: number, targetY: number): boolean
    {
        if(this._snowballCount < 1)
        {
            return false;
        }

        this.stopMovement();

        const location = this._currentLocation as Location3D;
        const angle = Direction360.getAngleFromComponents(targetX - location.x, targetY - location.y);
        const direction = Direction8.requireDirection8(Direction360.direction360ValueToDirection8(angle)).intValue();

        this.setBodyDirection(Direction8.requireDirection8(Direction8.getDirection8(direction)));

        if(log.isEnabled(LogLevel.TRACE))
        {
            log.trace(
                `Turning to:${direction} 360 value:${angle} target:${targetX},${targetY}`
                + ` location:${location.x},${location.y}`
            );
        }

        this._snowballCount = this._snowballCount - 1;

        return true;
    }

    // AS3: HumanGameObject.as::canMove()
    public canMove(): boolean
    {
        return this._activityState === 0 || this._activityState === 3;
    }

    /** A ghost may always make snowballs — its count is a prediction, not a stock. */
    // AS3: HumanGameObject.as::canMakeSnowballs()
    public canMakeSnowballs(): boolean
    {
        return (this._activityState === 0 || this._activityState === 3) && (this._snowballCount < 5 || this.isGhost);
    }

    // AS3: HumanGameObject.as::startMakingSnowball()
    public startMakingSnowball(): void
    {
        if(this.canMakeSnowballs())
        {
            this._activityState = 1;
            this._activityTimer = 20;
            this.stopMovement();
        }
    }

    // AS3: HumanGameObject.as::getRemainingSnowballCapacity()
    public getRemainingSnowballCapacity(): number
    {
        return 5 - this._snowballCount;
    }

    /** Unclamped — the caller is expected to have asked `getRemainingSnowballCapacity()` first. */
    // AS3: HumanGameObject.as::addSnowballs()
    public addSnowballs(count: number): void
    {
        this._snowballCount += count;
    }

    // AS3: HumanGameObject.as::isStunned()
    public isStunned(): boolean
    {
        return this._activityState === 2;
    }

    // AS3: HumanGameObject.as::get name()
    public get name(): string
    {
        return this._name;
    }

    // AS3: HumanGameObject.as::get mission()
    public get mission(): string
    {
        return this._mission;
    }

    // AS3: HumanGameObject.as::get figure()
    public get figure(): string
    {
        return this._figure;
    }

    // AS3: HumanGameObject.as::get sex()
    public get sex(): string
    {
        return this._sex;
    }

    // AS3: HumanGameObject.as::get score()
    public get score(): number
    {
        return this._score;
    }

    // AS3: HumanGameObject.as::get team()
    public get team(): number
    {
        return this._team;
    }

    // AS3: HumanGameObject.as::get snowballs()
    public get snowballs(): number
    {
        return this._snowballCount;
    }

    // AS3: HumanGameObject.as::get hitPoints()
    public get hitPoints(): number
    {
        return this._hitPoints;
    }

    /** Throwing wins over everything, then the activity state, then whether the player is walking. */
    // AS3: HumanGameObject.as::get posture()
    public get posture(): string
    {
        if(this._throwTimer > 0)
        {
            return 'swthrow';
        }

        switch(this._activityState - 1)
        {
            case 0:
                return 'swpick';
            case 1:
                return 'swdieback';
            default:
                if(this._isMoving)
                {
                    return 'swrun';
                }

                return 'std';
        }
    }

    /**
     * **Both arms answer the same thing.** AS3 writes a switch whose only case and whose default
     * both return `figure_dance`, so the action never varies; transcribed as written rather than
     * collapsed, because the shape is what says a distinction was intended and lost.
     */
    // AS3: HumanGameObject.as::get action()
    public get action(): string
    {
        switch(this._activityState - 3)
        {
            case 0:
                return 'figure_dance';
            default:
                return 'figure_dance';
        }
    }

    /** The action's parameter: mid-throw, the last frame of a throw, or the invincible flicker. */
    // AS3: HumanGameObject.as::get parameter()
    public get parameter(): number
    {
        if(this._throwTimer > 1)
        {
            return 1;
        }

        if(this._throwTimer === 1)
        {
            return 0;
        }

        switch(this._activityState - 3)
        {
            case 0:
                return 1;
            default:
                return 0;
        }
    }

    /** Ghosts, stunned and invincible players are all untouchable, and nobody hits their own ball. */
    // AS3: HumanGameObject.as::testSnowBallCollision()
    public override testSnowBallCollision(snowBall: SnowBallGameObject): boolean
    {
        if(
            !this._isGhost
            && this._activityState !== 2
            && this._activityState !== 3
            && snowBall.throwingHuman !== this
            && Boolean(super.testSnowBallCollision(snowBall))
        )
        {
            return true;
        }

        return false;
    }

    // AS3: HumanGameObject.as::onSnowBallHit()
    public override onSnowBallHit(stage: SnowWarGameStage, snowBall: SnowBallGameObject): void
    {
        const thrower = snowBall.throwingHuman;

        if(thrower === null)
        {
            // AS3 dereferences this unguarded and would fail the sub-turn. A ball always has a
            // thrower in practice; the port drops the hit rather than taking the arena down with it.
            log.warn('Snowball hit a player with no thrower; ignoring.');

            return;
        }

        this.playerIsHitBySnowball(stage, thrower, snowBall.direction360.intValue());
        thrower.onHitHuman(stage, this);

        // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/game/snowwar/SnowWarEngine.as::playSound()
        SnowWarEngine.playSound('HBSTG_snowwar_hit1');
    }

    /** A flat 5,000 — `PLAYER_HEIGHT`, which AS3 also writes here as a literal. */
    // AS3: HumanGameObject.as::get collisionHeight()
    public override get collisionHeight(): number
    {
        return 5000;
    }

    // AS3: HumanGameObject.as::toString()
    public toString(): string
    {
        return ` ref:${this._id}_name:${this._name}`;
    }

    /**
     * TS-only: the three places AS3 calls `SnowWarEngine.stopWaitingForSnowball(gameObjectId)`,
     * collected into one.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/game/snowwar/SnowWarEngine.as::stopWaitingForSnowball()
    private stopWaitingForSnowball(): void
    {
        this._snowWarEngine?.stopWaitingForSnowball(this.gameObjectId);
    }

    // AS3: HumanGameObject.as::dispose()
    public override dispose(): void
    {
        super.dispose();

        this._sex = '';
        this._name = '';
        this._mission = '';
        this._figure = '';
        this._team = 0;
        this._userId = 0;
        this._currentLocation = null;
        this._stoppedDir = null;
        this._moveTarget = null;
        this._snowballCount = 0;
        this._score = 0;
        this._isMoving = false;
        this._snowWarEngine = null;
        this._ghostLocations = null;
    }
}

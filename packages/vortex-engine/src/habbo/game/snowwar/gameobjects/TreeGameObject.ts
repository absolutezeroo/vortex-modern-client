import {Exception} from '@core/runtime/exceptions/Exception';
import type {TreeGameObjectData} from '@habbo/communication/messages/parser/game/snowwar/data/TreeGameObjectData';

import type {SynchronizedGameStage} from '../arena/SynchronizedGameStage';
import type {SnowWarGameStage} from '../SnowWarGameStage';
import {Direction360} from '../utils/Direction360';
import {Direction8} from '../utils/Direction8';
import type {Location3D} from '../utils/Location3D';
import {Tile} from '../Tile';
import {SnowBallGameObject} from './SnowBallGameObject';
import {SnowWarGameObject} from './SnowWarGameObject';

/**
 * Cover that wears out. Every hit counts, and at `maxHits` the tree takes itself off its tile and
 * stops blocking snowballs — the sprite stays, the collision does not.
 *
 * `BOUNDING_DATA` is a tile's width minus a snowball's radius minus one, so a snowball that would
 * just graze the next tile still misses. That is a deliberate one-unit margin, not a rounding
 * accident.
 *
 * A tree also *lowers* its tile's height by its own on construction, and blocks it outright — the
 * height it contributed as scenery is subtracted because the tree itself is now the obstacle.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/game/snowwar/gameobjects/TreeGameObject.as
 */
export class TreeGameObject extends SnowWarGameObject
{
    // AS3: TreeGameObject.as::NO_BOUNDING_DATA
    private static readonly NO_BOUNDING_DATA: number[] = [0];

    // AS3: TreeGameObject.as::BOUNDING_DATA
    private static readonly BOUNDING_DATA: number[] = [3200 - SnowBallGameObject.BOUNDING_DATA[0] - 1];

    /** Derived name — `_SafeStr_7546`, from the `fuseObjectId` getter that reads it. */
    // AS3: TreeGameObject.as::_SafeStr_7546
    private _fuseObjectId: number = 0;

    // AS3: TreeGameObject.as::_tile
    private _tile: Tile | null = null;

    // AS3: TreeGameObject.as::_direction8
    private _direction8: Direction8 | null = null;

    // AS3: TreeGameObject.as::_direction360
    private _direction360: Direction360 | null = null;

    /** Name recovered from the 2016 tree, where it is `_height` — `_SafeStr_4970` in the primary. */
    // AS3: TreeGameObject.as::_SafeStr_4970
    private _height: number = 0;

    /** Name recovered from the 2016 tree, where it is `_maximumHits` — `_SafeStr_6223` here. */
    // AS3: TreeGameObject.as::_SafeStr_6223
    private _maximumHits: number = 0;

    // AS3: TreeGameObject.as::_hits
    private _hits: number = 0;

    /** A tree that has already taken all its hits is not put on its tile. */
    // AS3: TreeGameObject.as::TreeGameObject()
    public constructor(data: TreeGameObjectData, stage: SnowWarGameStage)
    {
        super(data.id, false);

        this.isActive = true;
        this._tile = stage.getTileAt(Tile.convertToTileX(data.locationX3D), Tile.convertToTileY(data.locationY3D));
        this._direction8 = Direction8.requireDirection8(Direction8.getDirection8(data.direction));
        this._direction360 = new Direction360(Direction360.direction8ToDirection360Value(this._direction8));
        this._fuseObjectId = data.fuseObjectId;
        this._height = data.height;
        this._hits = data.hits;
        this._maximumHits = data.maxHits;

        if(this._hits < this._maximumHits)
        {
            stage.addGameObjectToTile(this);
        }

        (this._tile as Tile).addToHeight(-this._height);
        (this._tile as Tile).blocked = true;
    }

    // AS3: TreeGameObject.as::get numberOfVariables()
    public override get numberOfVariables(): number
    {
        return 9;
    }

    /** The nine slots mirror `TreeGameObjectData`'s wire order exactly. */
    // AS3: TreeGameObject.as::getVariable()
    public override getVariable(index: number): number
    {
        switch(index)
        {
            case 0:
                return 2;
            case 1:
                return this.gameObjectId;
            case 2:
                return (this._tile as Tile).location.x;
            case 3:
                return (this._tile as Tile).location.y;
            case 4:
                return (this._direction8 as Direction8).intValue();
            case 5:
                return this._height;
            case 6:
                return this._fuseObjectId;
            case 7:
                return this._maximumHits;
            case 8:
                return this._hits;
            default:
                throw new Exception(`No such variable:${index}`);
        }
    }

    /** 2 is `CollisionUtils.BOUNDING_TYPE_CIRCLE`. */
    // AS3: TreeGameObject.as::get boundingType()
    public override get boundingType(): number
    {
        return 2;
    }

    // AS3: TreeGameObject.as::subturn()
    public override subturn(stage: SynchronizedGameStage): void
    {
        void stage;
    }

    /** A felled tree keeps a radius of zero, so snowballs pass straight through it. */
    // AS3: TreeGameObject.as::get boundingData()
    public override get boundingData(): number[]
    {
        if(this._hits < this._maximumHits)
        {
            return TreeGameObject.BOUNDING_DATA;
        }

        return TreeGameObject.NO_BOUNDING_DATA;
    }

    // AS3: TreeGameObject.as::get location3D()
    public override get location3D(): Location3D
    {
        return (this._tile as Tile).location;
    }

    // AS3: TreeGameObject.as::get direction360()
    public override get direction360(): Direction360
    {
        return this._direction360 as Direction360;
    }

    /**
     * The count is clamped before the tile is cleared, so the hit that fells the tree both registers
     * and removes it in the same call.
     */
    // AS3: TreeGameObject.as::onSnowBallHit()
    public override onSnowBallHit(stage: SnowWarGameStage, snowBall: SnowBallGameObject): void
    {
        void stage;
        void snowBall;

        if(this._hits < this._maximumHits)
        {
            this._hits = this._hits + 1;
        }

        if(this._hits >= this._maximumHits)
        {
            (this._tile as Tile).removeGameObject();
        }
    }

    // AS3: TreeGameObject.as::get maxHits()
    public get maxHits(): number
    {
        return this._maximumHits;
    }

    // AS3: TreeGameObject.as::get hits()
    public get hits(): number
    {
        return this._hits;
    }

    // AS3: TreeGameObject.as::get fuseObjectId()
    public get fuseObjectId(): number
    {
        return this._fuseObjectId;
    }

    /** Its own height, not `boundingData[0]` — a tree is tall, and its radius is unrelated. */
    // AS3: TreeGameObject.as::get collisionHeight()
    public override get collisionHeight(): number
    {
        return this._height;
    }
}

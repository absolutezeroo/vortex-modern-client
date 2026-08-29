import type {SynchronizedGameStage} from '../arena/SynchronizedGameStage';
import type {SnowWarGameStage} from '../SnowWarGameStage';
import type {Direction360} from '../utils/Direction360';
import type {Location3D} from '../utils/Location3D';
import type {Tile} from '../Tile';
import type {SnowBallGameObject} from './SnowBallGameObject';
import {SnowWarGameObject} from './SnowWarGameObject';

/**
 * Whatever a player can walk up to and take snowballs from: a pile or a machine.
 *
 * It sits on a tile and borrows that tile's position rather than keeping its own, so it can never
 * drift out of alignment with the square it occupies.
 *
 * `onSnowballPickup()` is the hook the two subclasses use to react to being emptied — a pile
 * shrinks and eventually takes itself off its tile, a machine does nothing and refills later.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/game/snowwar/gameobjects/SnowballGivingGameObject.as
 */
export class SnowballGivingGameObject extends SnowWarGameObject
{
    /** Derived name — `_SafeStr_7546`, from the `fuseObjectId` getter that reads it. */
    // AS3: SnowballGivingGameObject.as::_SafeStr_7546
    protected _fuseObjectId: number = 0;

    /** Derived name — `_SafeStr_4779`, from the `snowballCount` getter that reads it. */
    // AS3: SnowballGivingGameObject.as::_SafeStr_4779
    protected _snowballCount: number = 0;

    /** Derived name — `_SafeStr_4647`, from `location3D` reading `_tile.location`. */
    // AS3: SnowballGivingGameObject.as::_SafeStr_4647
    protected _tile: Tile | null = null;

    // AS3: SnowballGivingGameObject.as::SnowballGivingGameObject()
    public constructor(id: number, snowballCount: number, tile: Tile, fuseObjectId: number)
    {
        super(id, false);

        this._active = true;
        this._snowballCount = snowballCount;
        this._tile = tile;
        this._fuseObjectId = fuseObjectId;
    }

    /** Null even though the base already answers null — AS3 restates it here. */
    // AS3: SnowballGivingGameObject.as::get direction360()
    public override get direction360(): Direction360
    {
        return null as unknown as Direction360;
    }

    /** 2 is `CollisionUtils.BOUNDING_TYPE_CIRCLE`. */
    // AS3: SnowballGivingGameObject.as::get boundingType()
    public override get boundingType(): number
    {
        return 2;
    }

    // AS3: SnowballGivingGameObject.as::get location3D()
    public override get location3D(): Location3D
    {
        return (this._tile as Tile).location;
    }

    // AS3: SnowballGivingGameObject.as::get fuseObjectId()
    public get fuseObjectId(): number
    {
        return this._fuseObjectId;
    }

    // AS3: SnowballGivingGameObject.as::get snowballCount()
    public get snowballCount(): number
    {
        return this._snowballCount;
    }

    // AS3: SnowballGivingGameObject.as::subturn()
    public override subturn(stage: SynchronizedGameStage): void
    {
        void stage;
    }

    /**
     * Hands over as many as it has, capped by what was asked, and answers how many that was — the
     * caller uses the return value to decide how many the player actually gained.
     */
    // AS3: SnowballGivingGameObject.as::pickupSnowballs()
    public pickupSnowballs(wanted: number): number
    {
        let taken = wanted;

        if(this._snowballCount < taken)
        {
            taken = this._snowballCount;
        }

        this._snowballCount -= taken;
        this.onSnowballPickup();

        return taken;
    }

    /** A snowball passing through does nothing to a pile or a machine. */
    // AS3: SnowballGivingGameObject.as::onSnowBallHit()
    public override onSnowBallHit(stage: SnowWarGameStage, snowBall: SnowBallGameObject): void
    {
        void stage;
        void snowBall;
    }

    // AS3: SnowballGivingGameObject.as::onSnowballPickup()
    protected onSnowballPickup(): void
    {
    }

    // AS3: SnowballGivingGameObject.as::dispose()
    public override dispose(): void
    {
        super.dispose();

        this._tile = null;
    }
}

import {Exception} from '@core/runtime/exceptions/Exception';
import type {SnowballPileGameObjectData} from '@habbo/communication/messages/parser/game/snowwar/data/SnowballPileGameObjectData';

import type {SnowWarGameStage} from '../SnowWarGameStage';
import {Tile} from '../Tile';
import {SnowballGivingGameObject} from './SnowballGivingGameObject';

/**
 * A heap of snow that shrinks as it is taken.
 *
 * Its collision radius **is** its stock: `snowballCount × 100`. An emptied pile therefore has radius
 * zero and, having also taken itself off its tile, stops existing as far as the arena is concerned
 * without ever being removed from the object list.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/game/snowwar/gameobjects/SnowballPileGameObject.as
 */
export class SnowballPileGameObject extends SnowballGivingGameObject
{
    /**
     * Declared in AS3 and never referenced — every use is the inlined literal 100, which is what the
     * decompiled body shows. Kept so the number has a name somewhere.
     */
    // AS3: SnowballPileGameObject.as::BOUNDING_DATA_PER_SNOWBALL
    private static readonly BOUNDING_DATA_PER_SNOWBALL: number = 100;

    /** Derived name — `_SafeStr_8308`, from the `boundingData` getter that reads it. */
    // AS3: SnowballPileGameObject.as::_SafeStr_8308
    private _boundingData: number[] = [];

    // AS3: SnowballPileGameObject.as::_maxSnowballs
    private _maxSnowballs: number = 0;

    /**
     * A pile that is already empty is **not** put on its tile, so nothing blocks the square and
     * nothing can be picked up there.
     */
    // AS3: SnowballPileGameObject.as::SnowballPileGameObject()
    public constructor(data: SnowballPileGameObjectData, stage: SnowWarGameStage)
    {
        super(
            data.id,
            data.snowballCount,
            stage.getTileAt(Tile.convertToTileX(data.locationX3D), Tile.convertToTileY(data.locationY3D)) as Tile,
            data.fuseObjectId
        );

        this._maxSnowballs = data.maxSnowballs;

        if(this._snowballCount > 0)
        {
            stage.addGameObjectToTile(this);
        }

        this._boundingData = [this._snowballCount * 100];
    }

    // AS3: SnowballPileGameObject.as::get numberOfVariables()
    public override get numberOfVariables(): number
    {
        return 7;
    }

    /**
     * The seven slots are the same seven `SnowballPileGameObjectData` reads off the wire, in the
     * same order — index 0 being the object type. That correspondence is what the checksum rests on.
     */
    // AS3: SnowballPileGameObject.as::getVariable()
    public override getVariable(index: number): number
    {
        switch(index)
        {
            case 0:
                return 3;
            case 1:
                return this._id;
            case 2:
                return (this._tile as Tile).location.x;
            case 3:
                return (this._tile as Tile).location.y;
            case 4:
                return this._maxSnowballs;
            case 5:
                return this._snowballCount;
            case 6:
                return this._fuseObjectId;
            default:
                throw new Exception(`No such variable:${index}`);
        }
    }

    // AS3: SnowballPileGameObject.as::get boundingData()
    public override get boundingData(): number[]
    {
        return this._boundingData;
    }

    /** Shrinks the radius, and clears the tile once there is nothing left to take. */
    // AS3: SnowballPileGameObject.as::onSnowballPickup()
    protected override onSnowballPickup(): void
    {
        this._boundingData = [this._snowballCount * 100];

        if(this._snowballCount <= 0)
        {
            (this._tile as Tile).removeGameObject();
        }
    }

    // AS3: SnowballPileGameObject.as::get maxSnowballs()
    public get maxSnowballs(): number
    {
        return this._maxSnowballs;
    }
}

import {Exception} from '@core/runtime/exceptions/Exception';
import type {SnowballMachineGameObjectData} from '@habbo/communication/messages/parser/game/snowwar/data/SnowballMachineGameObjectData';

import type {SnowWarGameStage} from '../SnowWarGameStage';
import {Direction8} from '../utils/Direction8';
import {Tile} from '../Tile';
import {SnowballGivingGameObject} from './SnowballGivingGameObject';

/**
 * A machine that refills itself one snowball at a time, up to its ceiling.
 *
 * Unlike a pile its collision radius is fixed at 1,200 whatever its stock, and it is always put on
 * its tile — an empty machine still blocks the square, because it will fill up again.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/game/snowwar/gameobjects/SnowballMachineGameObject.as
 */
export class SnowballMachineGameObject extends SnowballGivingGameObject
{
    /** AS3 declares this a `static var`; nothing in any tree assigns to it, so the port seals it. */
    // AS3: SnowballMachineGameObject.as::BOUNDING_DATA
    public static readonly BOUNDING_DATA: number[] = [1200];

    // AS3: SnowballMachineGameObject.as::_maxSnowballs
    private _maxSnowballs: number = 0;

    /** Derived name — `_SafeStr_7697`, from variable slot 4, which the DTO calls `direction`. */
    // AS3: SnowballMachineGameObject.as::_SafeStr_7697
    private _direction8: Direction8 | null = null;

    // AS3: SnowballMachineGameObject.as::SnowballMachineGameObject()
    public constructor(data: SnowballMachineGameObjectData, stage: SnowWarGameStage)
    {
        super(
            data.id,
            data.snowballCount,
            stage.getTileAt(Tile.convertToTileX(data.locationX3D), Tile.convertToTileY(data.locationY3D)) as Tile,
            data.fuseObjectId
        );

        this._maxSnowballs = data.maxSnowballs;
        this._direction8 = Direction8.requireDirection8(Direction8.getDirection8(data.direction));

        stage.addGameObjectToTile(this);
    }

    // AS3: SnowballMachineGameObject.as::get numberOfVariables()
    public override get numberOfVariables(): number
    {
        return 8;
    }

    /** The eight slots mirror `SnowballMachineGameObjectData`'s wire order exactly. */
    // AS3: SnowballMachineGameObject.as::getVariable()
    public override getVariable(index: number): number
    {
        switch(index)
        {
            case 0:
                return 4;
            case 1:
                return this._id;
            case 2:
                return (this._tile as Tile).location.x;
            case 3:
                return (this._tile as Tile).location.y;
            case 4:
                return (this._direction8 as Direction8).intValue();
            case 5:
                return this._maxSnowballs;
            case 6:
                return this._snowballCount;
            case 7:
                return this._fuseObjectId;
            default:
                throw new Exception(`No such variable:${index}`);
        }
    }

    // AS3: SnowballMachineGameObject.as::get boundingData()
    public override get boundingData(): number[]
    {
        return SnowballMachineGameObject.BOUNDING_DATA;
    }

    /** One per call, and silently nothing once full. */
    // AS3: SnowballMachineGameObject.as::createSnowball()
    public createSnowball(): void
    {
        if(this._snowballCount < this._maxSnowballs)
        {
            this._snowballCount = this._snowballCount + 1;
        }
    }

    // AS3: SnowballMachineGameObject.as::dispose()
    public override dispose(): void
    {
        super.dispose();

        this._direction8 = null;
    }
}

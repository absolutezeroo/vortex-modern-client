import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

import {SnowWarGameObjectData} from './SnowWarGameObjectData';

/**
 * A snowball in flight.
 *
 * The three `TRAJECTORY_*` constants are the arc the thrower picked, and they are the only part of
 * a snowball the player chooses — everything else here is the simulation's state at the turn this
 * packet describes.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1721/SnowballGameObjectData.as
 */
export class SnowballGameObjectData extends SnowWarGameObjectData
{
    /** Name recovered from `HumanGameObjectData` in the 2016 tree, where the same constant is `NUM_OF_VARIABLES`. */
    // AS3: SnowballGameObjectData.as::NUM_OF_VARIABLES
    public static readonly NUM_OF_VARIABLES: number = 11;

    // AS3: SnowballGameObjectData.as::TRAJECTORY_QUICK_THROW
    public static readonly TRAJECTORY_QUICK_THROW: number = 0;

    // AS3: SnowballGameObjectData.as::TRAJECTORY_SHORT_LOB
    public static readonly TRAJECTORY_SHORT_LOB: number = 1;

    // AS3: SnowballGameObjectData.as::TRAJECTORY_LONG_LOB
    public static readonly TRAJECTORY_LONG_LOB: number = 2;

    // AS3: SnowballGameObjectData.as::SnowballGameObjectData()
    public constructor(type: number, id: number)
    {
        super(type, id);
    }

    // AS3: SnowballGameObjectData.as::parse()
    public override parse(wrapper: IMessageDataWrapper): void
    {
        this.parseVariables(wrapper, SnowballGameObjectData.NUM_OF_VARIABLES);
    }

    // AS3: SnowballGameObjectData.as::get locationX3D()
    public get locationX3D(): number
    {
        return this.getVariable(2);
    }

    // AS3: SnowballGameObjectData.as::get locationY3D()
    public get locationY3D(): number
    {
        return this.getVariable(3);
    }

    // AS3: SnowballGameObjectData.as::get locationZ3D()
    public get locationZ3D(): number
    {
        return this.getVariable(4);
    }

    // AS3: SnowballGameObjectData.as::get movementDirection360()
    public get movementDirection360(): number
    {
        return this.getVariable(5);
    }

    // AS3: SnowballGameObjectData.as::get trajectory()
    public get trajectory(): number
    {
        return this.getVariable(6);
    }

    // AS3: SnowballGameObjectData.as::get timeToLive()
    public get timeToLive(): number
    {
        return this.getVariable(7);
    }

    // AS3: SnowballGameObjectData.as::get throwingHuman()
    public get throwingHuman(): number
    {
        return this.getVariable(8);
    }

    // AS3: SnowballGameObjectData.as::get parabolaOffset()
    public get parabolaOffset(): number
    {
        return this.getVariable(9);
    }

    // AS3: SnowballGameObjectData.as::get planarVelocity()
    public get planarVelocity(): number
    {
        return this.getVariable(10);
    }
}

// TS-only: ESM cycle breaker — see SnowWarGameObjectData.register().
SnowWarGameObjectData.register(SnowWarGameObjectData.OBJECT_TYPE_SNOWBALL, SnowballGameObjectData);

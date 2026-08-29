import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

import {SnowWarGameObjectData} from './SnowWarGameObjectData';

/**
 * A pile of snow a player walks onto to refill. It holds a count and a ceiling, and nothing else —
 * unlike a machine it has no direction, because there is nothing to aim.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1721/SnowballPileGameObjectData.as
 */
export class SnowballPileGameObjectData extends SnowWarGameObjectData
{
    /** Name recovered from `HumanGameObjectData` in the 2016 tree, where the same constant is `NUM_OF_VARIABLES`. */
    // AS3: SnowballPileGameObjectData.as::NUM_OF_VARIABLES
    public static readonly NUM_OF_VARIABLES: number = 7;

    // AS3: SnowballPileGameObjectData.as::SnowballPileGameObjectData()
    public constructor(type: number, id: number)
    {
        super(type, id);
    }

    // AS3: SnowballPileGameObjectData.as::parse()
    public override parse(wrapper: IMessageDataWrapper): void
    {
        this.parseVariables(wrapper, SnowballPileGameObjectData.NUM_OF_VARIABLES);
    }

    // AS3: SnowballPileGameObjectData.as::get locationX3D()
    public get locationX3D(): number
    {
        return this.getVariable(2);
    }

    // AS3: SnowballPileGameObjectData.as::get locationY3D()
    public get locationY3D(): number
    {
        return this.getVariable(3);
    }

    // AS3: SnowballPileGameObjectData.as::get maxSnowballs()
    public get maxSnowballs(): number
    {
        return this.getVariable(4);
    }

    // AS3: SnowballPileGameObjectData.as::get snowballCount()
    public get snowballCount(): number
    {
        return this.getVariable(5);
    }

    // AS3: SnowballPileGameObjectData.as::get fuseObjectId()
    public get fuseObjectId(): number
    {
        return this.getVariable(6);
    }
}

// TS-only: ESM cycle breaker — see SnowWarGameObjectData.register().
SnowWarGameObjectData.register(SnowWarGameObjectData.OBJECT_TYPE_SNOWBALL_PILE, SnowballPileGameObjectData);

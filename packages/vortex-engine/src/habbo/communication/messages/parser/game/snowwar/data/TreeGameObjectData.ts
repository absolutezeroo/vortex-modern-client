import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

import {SnowWarGameObjectData} from './SnowWarGameObjectData';

/**
 * A tree — cover that wears out. `maxHits` is how many snowballs it takes before it is gone, `hits`
 * how many it has taken so far, and `fuseObjectId` ties it back to the `FuseObjectData` the level
 * shipped so the arena knows what to draw.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1721/TreeGameObjectData.as
 */
export class TreeGameObjectData extends SnowWarGameObjectData
{
    /** Name recovered from `HumanGameObjectData` in the 2016 tree, where the same constant is `NUM_OF_VARIABLES`. */
    // AS3: TreeGameObjectData.as::NUM_OF_VARIABLES
    public static readonly NUM_OF_VARIABLES: number = 9;

    // AS3: TreeGameObjectData.as::TreeGameObjectData()
    public constructor(type: number, id: number)
    {
        super(type, id);
    }

    // AS3: TreeGameObjectData.as::parse()
    public override parse(wrapper: IMessageDataWrapper): void
    {
        this.parseVariables(wrapper, TreeGameObjectData.NUM_OF_VARIABLES);
    }

    // AS3: TreeGameObjectData.as::get locationX3D()
    public get locationX3D(): number
    {
        return this.getVariable(2);
    }

    // AS3: TreeGameObjectData.as::get locationY3D()
    public get locationY3D(): number
    {
        return this.getVariable(3);
    }

    // AS3: TreeGameObjectData.as::get direction()
    public get direction(): number
    {
        return this.getVariable(4);
    }

    // AS3: TreeGameObjectData.as::get height()
    public get height(): number
    {
        return this.getVariable(5);
    }

    // AS3: TreeGameObjectData.as::get fuseObjectId()
    public get fuseObjectId(): number
    {
        return this.getVariable(6);
    }

    // AS3: TreeGameObjectData.as::get maxHits()
    public get maxHits(): number
    {
        return this.getVariable(7);
    }

    // AS3: TreeGameObjectData.as::get hits()
    public get hits(): number
    {
        return this.getVariable(8);
    }
}

// TS-only: ESM cycle breaker — see SnowWarGameObjectData.register().
SnowWarGameObjectData.register(SnowWarGameObjectData.OBJECT_TYPE_TREE, TreeGameObjectData);

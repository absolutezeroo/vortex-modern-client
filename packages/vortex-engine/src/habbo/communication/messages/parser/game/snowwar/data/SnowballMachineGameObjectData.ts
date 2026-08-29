import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

import {SnowWarGameObjectData} from './SnowWarGameObjectData';

/**
 * A snowball machine: a pile that faces a direction and refills itself over time. The `direction`
 * is what separates it from `SnowballPileGameObjectData` on the wire — the other five fields are
 * the same, in the same order.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1721/SnowballMachineGameObjectData.as
 */
export class SnowballMachineGameObjectData extends SnowWarGameObjectData
{
    /** Name recovered from `HumanGameObjectData` in the 2016 tree, where the same constant is `NUM_OF_VARIABLES`. */
    // AS3: SnowballMachineGameObjectData.as::NUM_OF_VARIABLES
    public static readonly NUM_OF_VARIABLES: number = 8;

    // AS3: SnowballMachineGameObjectData.as::SnowballMachineGameObjectData()
    public constructor(type: number, id: number)
    {
        super(type, id);
    }

    // AS3: SnowballMachineGameObjectData.as::parse()
    public override parse(wrapper: IMessageDataWrapper): void
    {
        this.parseVariables(wrapper, SnowballMachineGameObjectData.NUM_OF_VARIABLES);
    }

    // AS3: SnowballMachineGameObjectData.as::get locationX3D()
    public get locationX3D(): number
    {
        return this.getVariable(2);
    }

    // AS3: SnowballMachineGameObjectData.as::get locationY3D()
    public get locationY3D(): number
    {
        return this.getVariable(3);
    }

    // AS3: SnowballMachineGameObjectData.as::get direction()
    public get direction(): number
    {
        return this.getVariable(4);
    }

    // AS3: SnowballMachineGameObjectData.as::get maxSnowballs()
    public get maxSnowballs(): number
    {
        return this.getVariable(5);
    }

    // AS3: SnowballMachineGameObjectData.as::get snowballCount()
    public get snowballCount(): number
    {
        return this.getVariable(6);
    }

    // AS3: SnowballMachineGameObjectData.as::get fuseObjectId()
    public get fuseObjectId(): number
    {
        return this.getVariable(7);
    }
}

// TS-only: ESM cycle breaker — see SnowWarGameObjectData.register().
SnowWarGameObjectData.register(SnowWarGameObjectData.OBJECT_TYPE_SNOWBALL_MACHINE, SnowballMachineGameObjectData);

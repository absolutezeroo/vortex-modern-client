import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

import {SnowWarGameEventData} from './SnowWarGameEventData';

/**
 * A machine topped itself up by one. The reference is the machine's game-object id.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_4149/MachineCreatesSnowballEventData.as
 */
export class MachineCreatesSnowballEventData extends SnowWarGameEventData
{
    /** Derived name — `_SafeStr_9443`, from the `snowBallMachineReference` getter that reads it. */
    // AS3: MachineCreatesSnowballEventData.as::_SafeStr_9443
    private _snowBallMachineReference: number = 0;

    // AS3: MachineCreatesSnowballEventData.as::MachineCreatesSnowballEventData()
    public constructor(id: number)
    {
        super(id);
    }

    // AS3: MachineCreatesSnowballEventData.as::parse()
    public override parse(wrapper: IMessageDataWrapper): void
    {
        this._snowBallMachineReference = wrapper.readInt();
    }

    // AS3: MachineCreatesSnowballEventData.as::get snowBallMachineReference()
    public get snowBallMachineReference(): number
    {
        return this._snowBallMachineReference;
    }
}

// TS-only: ESM cycle breaker — see SnowWarGameEventData.register().
SnowWarGameEventData.register(SnowWarGameEventData.EVENT_TYPE_MACHINE_CREATES_SNOWBALL, MachineCreatesSnowballEventData);

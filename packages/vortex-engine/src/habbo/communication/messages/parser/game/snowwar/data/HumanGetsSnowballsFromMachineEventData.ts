import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

import {SnowWarGameEventData} from './SnowWarGameEventData';

/**
 * A player emptied a machine or a pile into their own hands. How many they got is not on the wire —
 * both sides derive it from the machine's `snowballCount` and the player's remaining capacity.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_4149/HumanGetsSnowballsFromMachineEventData.as
 */
export class HumanGetsSnowballsFromMachineEventData extends SnowWarGameEventData
{
    /** Derived name — `_SafeStr_9121`, from the `humanGameObjectId` getter that reads it. */
    // AS3: HumanGetsSnowballsFromMachineEventData.as::_SafeStr_9121
    private _humanGameObjectId: number = 0;

    /** Derived name — `_SafeStr_9443`, from the `snowBallMachineReference` getter that reads it. */
    // AS3: HumanGetsSnowballsFromMachineEventData.as::_SafeStr_9443
    private _snowBallMachineReference: number = 0;

    // AS3: HumanGetsSnowballsFromMachineEventData.as::HumanGetsSnowballsFromMachineEventData()
    public constructor(id: number)
    {
        super(id);
    }

    // AS3: HumanGetsSnowballsFromMachineEventData.as::parse()
    public override parse(wrapper: IMessageDataWrapper): void
    {
        this._humanGameObjectId = wrapper.readInt();
        this._snowBallMachineReference = wrapper.readInt();
    }

    // AS3: HumanGetsSnowballsFromMachineEventData.as::get humanGameObjectId()
    public get humanGameObjectId(): number
    {
        return this._humanGameObjectId;
    }

    // AS3: HumanGetsSnowballsFromMachineEventData.as::get snowBallMachineReference()
    public get snowBallMachineReference(): number
    {
        return this._snowBallMachineReference;
    }
}

// TS-only: ESM cycle breaker — see SnowWarGameEventData.register().
SnowWarGameEventData.register(SnowWarGameEventData.EVENT_TYPE_HUMAN_GETS_SNOWBALLS_FROM_MACHINE, HumanGetsSnowballsFromMachineEventData);

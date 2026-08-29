import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

import {SnowWarGameEventData} from './SnowWarGameEventData';

/**
 * A player crouched to make a snowball. The snowball appears later, through
 * `CreateSnowballEventData` — this event only starts the animation and the activity timer.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_4149/HumanStartsToMakeASnowballEventData.as
 */
export class HumanStartsToMakeASnowballEventData extends SnowWarGameEventData
{
    /** Derived name — `_SafeStr_9121`, from the `humanGameObjectId` getter that reads it. */
    // AS3: HumanStartsToMakeASnowballEventData.as::_SafeStr_9121
    private _humanGameObjectId: number = 0;

    // AS3: HumanStartsToMakeASnowballEventData.as::HumanStartsToMakeASnowballEventData()
    public constructor(id: number)
    {
        super(id);
    }

    // AS3: HumanStartsToMakeASnowballEventData.as::parse()
    public override parse(wrapper: IMessageDataWrapper): void
    {
        this._humanGameObjectId = wrapper.readInt();
    }

    // AS3: HumanStartsToMakeASnowballEventData.as::get humanGameObjectId()
    public get humanGameObjectId(): number
    {
        return this._humanGameObjectId;
    }
}

// TS-only: ESM cycle breaker — see SnowWarGameEventData.register().
SnowWarGameEventData.register(SnowWarGameEventData.EVENT_TYPE_HUMAN_STARTS_TO_MAKE_A_SNOWBALL, HumanStartsToMakeASnowballEventData);

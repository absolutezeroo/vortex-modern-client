import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

import {SnowWarGameEventData} from './SnowWarGameEventData';

/**
 * A player left. One field, and the arena deletes their game object on the turn it lands.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_4149/HumanLeftGameEventData.as
 */
export class HumanLeftGameEventData extends SnowWarGameEventData
{
    /** Derived name — `_SafeStr_9121`, from the `humanGameObjectId` getter that reads it. */
    // AS3: HumanLeftGameEventData.as::_SafeStr_9121
    private _humanGameObjectId: number = 0;

    // AS3: HumanLeftGameEventData.as::HumanLeftGameEventData()
    public constructor(id: number)
    {
        super(id);
    }

    // AS3: HumanLeftGameEventData.as::parse()
    public override parse(wrapper: IMessageDataWrapper): void
    {
        this._humanGameObjectId = wrapper.readInt();
    }

    // AS3: HumanLeftGameEventData.as::get humanGameObjectId()
    public get humanGameObjectId(): number
    {
        return this._humanGameObjectId;
    }
}

// TS-only: ESM cycle breaker — see SnowWarGameEventData.register().
SnowWarGameEventData.register(SnowWarGameEventData.EVENT_TYPE_HUMAN_LEFT_GAME, HumanLeftGameEventData);

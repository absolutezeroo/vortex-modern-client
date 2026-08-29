import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

import {SnowWarGameEventData} from './SnowWarGameEventData';

/**
 * A throw aimed at a player rather than at the ground. The snowball itself is not created here —
 * that is `CreateSnowballEventData`, a separate event on a later turn.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_4149/HumanThrowsSnowballAtHumanEventData.as
 */
export class HumanThrowsSnowballAtHumanEventData extends SnowWarGameEventData
{
    /** Derived name — `_SafeStr_9121`, from the `humanGameObjectId` getter that reads it. */
    // AS3: HumanThrowsSnowballAtHumanEventData.as::_SafeStr_9121
    private _humanGameObjectId: number = 0;

    /** Derived name — `_SafeStr_8959`, from the `targetHumanGameObjectId` getter that reads it. */
    // AS3: HumanThrowsSnowballAtHumanEventData.as::_SafeStr_8959
    private _targetHumanGameObjectId: number = 0;

    /** Derived name — `_SafeStr_4807`, from the `trajectory` getter that reads it. */
    // AS3: HumanThrowsSnowballAtHumanEventData.as::_SafeStr_4807
    private _trajectory: number = 0;

    // AS3: HumanThrowsSnowballAtHumanEventData.as::HumanThrowsSnowballAtHumanEventData()
    public constructor(id: number)
    {
        super(id);
    }

    // AS3: HumanThrowsSnowballAtHumanEventData.as::parse()
    public override parse(wrapper: IMessageDataWrapper): void
    {
        this._humanGameObjectId = wrapper.readInt();
        this._targetHumanGameObjectId = wrapper.readInt();
        this._trajectory = wrapper.readInt();
    }

    // AS3: HumanThrowsSnowballAtHumanEventData.as::get humanGameObjectId()
    public get humanGameObjectId(): number
    {
        return this._humanGameObjectId;
    }

    // AS3: HumanThrowsSnowballAtHumanEventData.as::get targetHumanGameObjectId()
    public get targetHumanGameObjectId(): number
    {
        return this._targetHumanGameObjectId;
    }

    // AS3: HumanThrowsSnowballAtHumanEventData.as::get trajectory()
    public get trajectory(): number
    {
        return this._trajectory;
    }
}

// TS-only: ESM cycle breaker — see SnowWarGameEventData.register().
SnowWarGameEventData.register(SnowWarGameEventData.EVENT_TYPE_HUMAN_THROWS_SNOWBALL_AT_HUMAN, HumanThrowsSnowballAtHumanEventData);

import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

import {SnowWarGameEventData} from './SnowWarGameEventData';

/**
 * A throw aimed at a tile. Same shape as the at-human throw with the target split into x/y.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_4149/HumanThrowsSnowballAtPositionEventData.as
 */
export class HumanThrowsSnowballAtPositionEventData extends SnowWarGameEventData
{
    /** Derived name — `_SafeStr_9121`, from the `humanGameObjectId` getter that reads it. */
    // AS3: HumanThrowsSnowballAtPositionEventData.as::_SafeStr_9121
    private _humanGameObjectId: number = 0;

    /** Derived name — `_SafeStr_5951`, from the `targetX` getter that reads it. */
    // AS3: HumanThrowsSnowballAtPositionEventData.as::_SafeStr_5951
    private _targetX: number = 0;

    /** Derived name — `_SafeStr_6068`, from the `targetY` getter that reads it. */
    // AS3: HumanThrowsSnowballAtPositionEventData.as::_SafeStr_6068
    private _targetY: number = 0;

    /** Derived name — `_SafeStr_4807`, from the `trajectory` getter that reads it. */
    // AS3: HumanThrowsSnowballAtPositionEventData.as::_SafeStr_4807
    private _trajectory: number = 0;

    // AS3: HumanThrowsSnowballAtPositionEventData.as::HumanThrowsSnowballAtPositionEventData()
    public constructor(id: number)
    {
        super(id);
    }

    // AS3: HumanThrowsSnowballAtPositionEventData.as::parse()
    public override parse(wrapper: IMessageDataWrapper): void
    {
        this._humanGameObjectId = wrapper.readInt();
        this._targetX = wrapper.readInt();
        this._targetY = wrapper.readInt();
        this._trajectory = wrapper.readInt();
    }

    // AS3: HumanThrowsSnowballAtPositionEventData.as::get humanGameObjectId()
    public get humanGameObjectId(): number
    {
        return this._humanGameObjectId;
    }

    // AS3: HumanThrowsSnowballAtPositionEventData.as::get targetX()
    public get targetX(): number
    {
        return this._targetX;
    }

    // AS3: HumanThrowsSnowballAtPositionEventData.as::get targetY()
    public get targetY(): number
    {
        return this._targetY;
    }

    // AS3: HumanThrowsSnowballAtPositionEventData.as::get trajectory()
    public get trajectory(): number
    {
        return this._trajectory;
    }
}

// TS-only: ESM cycle breaker — see SnowWarGameEventData.register().
SnowWarGameEventData.register(SnowWarGameEventData.EVENT_TYPE_HUMAN_THROWS_SNOWBALL_AT_POSITION, HumanThrowsSnowballAtPositionEventData);

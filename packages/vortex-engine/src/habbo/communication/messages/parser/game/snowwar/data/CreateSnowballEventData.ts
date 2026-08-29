import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

import {SnowWarGameEventData} from './SnowWarGameEventData';

/**
 * A snowball comes into existence, with the id it will keep for the rest of its flight.
 *
 * The id arrives from the server rather than being allocated locally, which is the whole point: two
 * clients that invented their own ids would diverge the moment one of them collided.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_4149/CreateSnowballEventData.as
 */
export class CreateSnowballEventData extends SnowWarGameEventData
{
    /** Derived name — `_SafeStr_9583`, from the `snowBallGameObjectId` getter that reads it. */
    // AS3: CreateSnowballEventData.as::_SafeStr_9583
    private _snowBallGameObjectId: number = 0;

    /** Derived name — `_SafeStr_9121`, from the `humanGameObjectId` getter that reads it. */
    // AS3: CreateSnowballEventData.as::_SafeStr_9121
    private _humanGameObjectId: number = 0;

    /** Derived name — `_SafeStr_5951`, from the `targetX` getter that reads it. */
    // AS3: CreateSnowballEventData.as::_SafeStr_5951
    private _targetX: number = 0;

    /** Derived name — `_SafeStr_6068`, from the `targetY` getter that reads it. */
    // AS3: CreateSnowballEventData.as::_SafeStr_6068
    private _targetY: number = 0;

    /** Derived name — `_SafeStr_4807`, from the `trajectory` getter that reads it. */
    // AS3: CreateSnowballEventData.as::_SafeStr_4807
    private _trajectory: number = 0;

    // AS3: CreateSnowballEventData.as::CreateSnowballEventData()
    public constructor(id: number)
    {
        super(id);
    }

    // AS3: CreateSnowballEventData.as::parse()
    public override parse(wrapper: IMessageDataWrapper): void
    {
        this._snowBallGameObjectId = wrapper.readInt();
        this._humanGameObjectId = wrapper.readInt();
        this._targetX = wrapper.readInt();
        this._targetY = wrapper.readInt();
        this._trajectory = wrapper.readInt();
    }

    // AS3: CreateSnowballEventData.as::get snowBallGameObjectId()
    public get snowBallGameObjectId(): number
    {
        return this._snowBallGameObjectId;
    }

    // AS3: CreateSnowballEventData.as::get humanGameObjectId()
    public get humanGameObjectId(): number
    {
        return this._humanGameObjectId;
    }

    // AS3: CreateSnowballEventData.as::get targetX()
    public get targetX(): number
    {
        return this._targetX;
    }

    // AS3: CreateSnowballEventData.as::get targetY()
    public get targetY(): number
    {
        return this._targetY;
    }

    // AS3: CreateSnowballEventData.as::get trajectory()
    public get trajectory(): number
    {
        return this._trajectory;
    }
}

// TS-only: ESM cycle breaker — see SnowWarGameEventData.register().
SnowWarGameEventData.register(SnowWarGameEventData.EVENT_TYPE_CREATE_SNOWBALL, CreateSnowballEventData);

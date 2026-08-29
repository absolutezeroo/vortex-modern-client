import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

import {SnowWarGameEventData} from './SnowWarGameEventData';

/**
 * Somebody clicked a tile. The path is not on the wire — every client runs the same A-star from the
 * player's current position to this target, which is why `AbstractAStarNode` and the fixed-point
 * maths under `snowwar/utils/` have to agree bit for bit.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_4149/NewMoveTargetEventData.as
 */
export class NewMoveTargetEventData extends SnowWarGameEventData
{
    /** Derived name — `_SafeStr_9121`, from the `humanGameObjectId` getter that reads it. */
    // AS3: NewMoveTargetEventData.as::_SafeStr_9121
    private _humanGameObjectId: number = 0;

    /** Derived name — `_SafeStr_4555`, from the `x` getter that reads it. */
    // AS3: NewMoveTargetEventData.as::_SafeStr_4555
    private _x: number = 0;

    /** Derived name — `_SafeStr_4557`, from the `y` getter that reads it. */
    // AS3: NewMoveTargetEventData.as::_SafeStr_4557
    private _y: number = 0;

    // AS3: NewMoveTargetEventData.as::NewMoveTargetEventData()
    public constructor(id: number)
    {
        super(id);
    }

    // AS3: NewMoveTargetEventData.as::parse()
    public override parse(wrapper: IMessageDataWrapper): void
    {
        this._humanGameObjectId = wrapper.readInt();
        this._x = wrapper.readInt();
        this._y = wrapper.readInt();
    }

    // AS3: NewMoveTargetEventData.as::get humanGameObjectId()
    public get humanGameObjectId(): number
    {
        return this._humanGameObjectId;
    }

    // AS3: NewMoveTargetEventData.as::get x()
    public get x(): number
    {
        return this._x;
    }

    // AS3: NewMoveTargetEventData.as::get y()
    public get y(): number
    {
        return this._y;
    }
}

// TS-only: ESM cycle breaker — see SnowWarGameEventData.register().
SnowWarGameEventData.register(SnowWarGameEventData.EVENT_TYPE_NEW_MOVE_TARGET, NewMoveTargetEventData);

import type {SynchronizedGameStage} from '../arena/SynchronizedGameStage';
import type {HumanGameObject} from '../gameobjects/HumanGameObject';
import {AbstractSynchronizedGameEvent} from './AbstractSynchronizedGameEvent';

/**
 * Somebody clicked a tile.
 *
 * Only the *destination* travels. No path is sent and none is stored — every client walks the player
 * there one tile at a time out of `HumanGameObject.subturn()`, from the same start, by the same
 * rules. That is the whole reason the movement maths has to be integer-exact.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/game/snowwar/events/NewMoveTargetEvent.as
 */
export class NewMoveTargetEvent extends AbstractSynchronizedGameEvent
{
    // AS3: NewMoveTargetEvent.as::_humanGameObject
    private _humanGameObject: HumanGameObject | null = null;

    /** Derived name — `_SafeStr_4555`, from the `x` getter that reads it. */
    // AS3: NewMoveTargetEvent.as::_SafeStr_4555
    private _x: number = 0;

    /** Derived name — `_SafeStr_4557`, from the `y` getter that reads it. */
    // AS3: NewMoveTargetEvent.as::_SafeStr_4557
    private _y: number = 0;

    // AS3: NewMoveTargetEvent.as::NewMoveTargetEvent()
    public constructor(humanGameObject: HumanGameObject, x: number, y: number)
    {
        super();

        this._humanGameObject = humanGameObject;
        this._x = x;
        this._y = y;
    }

    // AS3: NewMoveTargetEvent.as::apply()
    public override apply(stage: SynchronizedGameStage): void
    {
        void stage;

        (this._humanGameObject as HumanGameObject).changeMoveTarget(this._x, this._y);
    }

    // AS3: NewMoveTargetEvent.as::get humanGameObject()
    public get humanGameObject(): HumanGameObject | null
    {
        return this._humanGameObject;
    }

    // AS3: NewMoveTargetEvent.as::get x()
    public get x(): number
    {
        return this._x;
    }

    // AS3: NewMoveTargetEvent.as::get y()
    public get y(): number
    {
        return this._y;
    }

    // AS3: NewMoveTargetEvent.as::dispose()
    public override dispose(): void
    {
        super.dispose();

        this._humanGameObject = null;
    }
}

import type {SynchronizedGameStage} from '../arena/SynchronizedGameStage';
import type {HumanGameObject} from '../gameobjects/HumanGameObject';
import {SnowBallGameObject} from '../gameobjects/SnowBallGameObject';
import {AbstractSynchronizedGameEvent} from './AbstractSynchronizedGameEvent';

/**
 * The snowball comes into existence.
 *
 * The **id arrives from the server** and the ball is built with it in the constructor, not in
 * `apply()` — two clients inventing their own ids would diverge the moment one of them collided.
 * `apply()` then adds it to the stage and launches it from wherever the thrower is standing *at that
 * moment*, at the fixed initial height of 3,000.
 *
 * This is a separate event from the throw itself: the thrower turns and spends a snowball on one
 * turn, and the ball appears on another.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/game/snowwar/events/CreateSnowballEvent.as
 */
export class CreateSnowballEvent extends AbstractSynchronizedGameEvent
{
    // AS3: CreateSnowballEvent.as::_snowBallGameObject
    private _snowBallGameObject: SnowBallGameObject | null = null;

    /** Derived name — `_SafeStr_6248`; the thrower, as on every other throw event. */
    // AS3: CreateSnowballEvent.as::_SafeStr_6248
    private _human: HumanGameObject | null = null;

    /** Derived name — `_SafeStr_5951`, matching `targetX` on the wire DTO. */
    // AS3: CreateSnowballEvent.as::_SafeStr_5951
    private _targetX: number = 0;

    /** Derived name — `_SafeStr_6068`, matching `targetY` on the wire DTO. */
    // AS3: CreateSnowballEvent.as::_SafeStr_6068
    private _targetY: number = 0;

    /** Derived name — `_SafeStr_4807`, matching `trajectory` on the wire DTO. */
    // AS3: CreateSnowballEvent.as::_SafeStr_4807
    private _trajectory: number = 0;

    // AS3: CreateSnowballEvent.as::CreateSnowballEvent()
    public constructor(snowBallGameObjectId: number, human: HumanGameObject, targetX: number, targetY: number, trajectory: number)
    {
        super();

        this._snowBallGameObject = new SnowBallGameObject(snowBallGameObjectId);
        this._human = human;
        this._targetX = targetX;
        this._targetY = targetY;
        this._trajectory = trajectory;
    }

    // AS3: CreateSnowballEvent.as::set snowBallGameObject()
    public set snowBallGameObject(snowBallGameObject: SnowBallGameObject)
    {
        this._snowBallGameObject = snowBallGameObject;
    }

    // AS3: CreateSnowballEvent.as::apply()
    public override apply(stage: SynchronizedGameStage): void
    {
        const snowBall = this._snowBallGameObject as SnowBallGameObject;
        const human = this._human as HumanGameObject;

        stage.addGameObject(snowBall.gameObjectId, snowBall);
        snowBall.isActive = true;

        const x = human.currentLocation.x;
        const y = human.currentLocation.y;

        snowBall.initialize(x, y, 3000, this._trajectory, this._targetX, this._targetY, human);
    }

    // AS3: CreateSnowballEvent.as::dispose()
    public override dispose(): void
    {
        super.dispose();

        this._snowBallGameObject = null;
        this._human = null;
    }
}

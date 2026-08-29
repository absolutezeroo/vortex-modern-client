import {Logger} from '@core/utils/Logger';

import type {SynchronizedGameStage} from '../arena/SynchronizedGameStage';
import type {HumanGameObject} from '../gameobjects/HumanGameObject';
import {AbstractSynchronizedGameEvent} from './AbstractSynchronizedGameEvent';

const log = Logger.getLogger('habbo.game.snowwar.events.HumanThrowsSnowballAtPositionEvent');

/**
 * A throw aimed at a point on the floor.
 *
 * The same two calls as the at-human throw, with the target fixed at click time instead of read from
 * a moving player. `trajectory` is likewise carried and unused here — it travels to
 * `CreateSnowballEvent`, which is what actually launches anything.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/game/snowwar/events/HumanThrowsSnowballAtPositionEvent.as
 */
export class HumanThrowsSnowballAtPositionEvent extends AbstractSynchronizedGameEvent
{
    /** Derived name — `_SafeStr_6248`, from the `human` getter that reads it. */
    // AS3: HumanThrowsSnowballAtPositionEvent.as::_SafeStr_6248
    private _human: HumanGameObject | null = null;

    /** Derived name — `_SafeStr_5951`, from the `targetX` getter that reads it. */
    // AS3: HumanThrowsSnowballAtPositionEvent.as::_SafeStr_5951
    private _targetX: number = 0;

    /** Derived name — `_SafeStr_6068`, from the `targetY` getter that reads it. */
    // AS3: HumanThrowsSnowballAtPositionEvent.as::_SafeStr_6068
    private _targetY: number = 0;

    /** Derived name — `_SafeStr_4807`, from the `trajectory` getter that reads it. */
    // AS3: HumanThrowsSnowballAtPositionEvent.as::_SafeStr_4807
    private _trajectory: number = 0;

    // AS3: HumanThrowsSnowballAtPositionEvent.as::HumanThrowsSnowballAtPositionEvent()
    public constructor(human: HumanGameObject, targetX: number, targetY: number, trajectory: number)
    {
        super();

        this._human = human;
        this._targetX = targetX;
        this._targetY = targetY;
        this._trajectory = trajectory;
    }

    // AS3: HumanThrowsSnowballAtPositionEvent.as::apply()
    public override apply(stage: SynchronizedGameStage): void
    {
        void stage;

        const human = this.human as HumanGameObject;

        human.throwSnowball(this.targetX, this.targetY);
        human.startThrowTimer();

        // TODO(AS3): sources/WIN63-202607011411-782849652/src/com/sulake/habbo/game/snowwar/SnowWarEngine.as::playSound()
        //   AS3 plays "HBSTG_snowwar_throw" here. SnowWarEngine is unported.
        log.trace('Throw (sound HBSTG_snowwar_throw not played: SnowWarEngine unported)');
    }

    // AS3: HumanThrowsSnowballAtPositionEvent.as::get human()
    public get human(): HumanGameObject | null
    {
        return this._human;
    }

    // AS3: HumanThrowsSnowballAtPositionEvent.as::get targetX()
    public get targetX(): number
    {
        return this._targetX;
    }

    // AS3: HumanThrowsSnowballAtPositionEvent.as::get targetY()
    public get targetY(): number
    {
        return this._targetY;
    }

    // AS3: HumanThrowsSnowballAtPositionEvent.as::get trajectory()
    public get trajectory(): number
    {
        return this._trajectory;
    }

    // AS3: HumanThrowsSnowballAtPositionEvent.as::dispose()
    public override dispose(): void
    {
        super.dispose();

        this._human = null;
    }
}

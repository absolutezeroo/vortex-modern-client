import {Logger} from '@core/utils/Logger';

import type {SynchronizedGameStage} from '../arena/SynchronizedGameStage';
import type {HumanGameObject} from '../gameobjects/HumanGameObject';
import {AbstractSynchronizedGameEvent} from './AbstractSynchronizedGameEvent';

const log = Logger.getLogger('habbo.game.snowwar.events.HumanThrowsSnowballAtHumanEvent');

/**
 * A throw aimed at another player.
 *
 * It aims at where the target is **when the event is applied**, not where they were when the click
 * happened — the target's location is read here, one turn later, and every client reads the same
 * one. No ball is created; that is `CreateSnowballEvent`.
 *
 * `trajectory` is carried and never used by this event: `throwSnowball()` takes only a point, and
 * the trajectory travels separately to the create event. Transcribed as declared.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/game/snowwar/events/HumanThrowsSnowballAtHumanEvent.as
 */
export class HumanThrowsSnowballAtHumanEvent extends AbstractSynchronizedGameEvent
{
    /** Derived name — `_SafeStr_6248`, from the `human` getter that reads it. */
    // AS3: HumanThrowsSnowballAtHumanEvent.as::_SafeStr_6248
    private _human: HumanGameObject | null = null;

    /** Derived name — `_SafeStr_6537`, from the `targetHuman` getter that reads it. */
    // AS3: HumanThrowsSnowballAtHumanEvent.as::_SafeStr_6537
    private _targetHuman: HumanGameObject | null = null;

    /** Derived name — `_SafeStr_4807`, from the `trajectory` getter that reads it. */
    // AS3: HumanThrowsSnowballAtHumanEvent.as::_SafeStr_4807
    private _trajectory: number = 0;

    // AS3: HumanThrowsSnowballAtHumanEvent.as::HumanThrowsSnowballAtHumanEvent()
    public constructor(human: HumanGameObject, targetHuman: HumanGameObject, trajectory: number)
    {
        super();

        this._human = human;
        this._targetHuman = targetHuman;
        this._trajectory = trajectory;
    }

    // AS3: HumanThrowsSnowballAtHumanEvent.as::apply()
    public override apply(stage: SynchronizedGameStage): void
    {
        void stage;

        const target = this._targetHuman as HumanGameObject;
        const human = this.human as HumanGameObject;

        human.throwSnowball(target.currentLocation.x, target.currentLocation.y);
        human.startThrowTimer();

        // TODO(AS3): sources/WIN63-202607011411-782849652/src/com/sulake/habbo/game/snowwar/SnowWarEngine.as::playSound()
        //   AS3 plays "HBSTG_snowwar_throw" here. SnowWarEngine is unported.
        log.trace('Throw (sound HBSTG_snowwar_throw not played: SnowWarEngine unported)');
    }

    // AS3: HumanThrowsSnowballAtHumanEvent.as::get human()
    public get human(): HumanGameObject | null
    {
        return this._human;
    }

    // AS3: HumanThrowsSnowballAtHumanEvent.as::get targetHuman()
    public get targetHuman(): HumanGameObject | null
    {
        return this._targetHuman;
    }

    // AS3: HumanThrowsSnowballAtHumanEvent.as::get trajectory()
    public get trajectory(): number
    {
        return this._trajectory;
    }

    /** Clears the trajectory too, unlike its sibling events. Transcribed as written. */
    // AS3: HumanThrowsSnowballAtHumanEvent.as::dispose()
    public override dispose(): void
    {
        super.dispose();

        this._human = null;
        this._targetHuman = null;
        this._trajectory = 0;
    }
}

import type {SynchronizedGameStage} from '../arena/SynchronizedGameStage';
import type {HumanGameObject} from '../gameobjects/HumanGameObject';
import {AbstractSynchronizedGameEvent} from './AbstractSynchronizedGameEvent';

/**
 * A player crouched to make a snowball.
 *
 * The snowball is not produced here — `startMakingSnowball()` only sets the activity state and its
 * timer, and the count goes up twenty sub-turns later when that timer runs out. The event can also
 * be a no-op: a player who is stunned, or already carrying five, is refused by `canMakeSnowballs()`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/game/snowwar/events/HumanStartsToMakeASnowballEvent.as
 */
export class HumanStartsToMakeASnowballEvent extends AbstractSynchronizedGameEvent
{
    /** Derived name — `_SafeStr_6248`, from the `human` getter that reads it. */
    // AS3: HumanStartsToMakeASnowballEvent.as::_SafeStr_6248
    private _human: HumanGameObject | null = null;

    // AS3: HumanStartsToMakeASnowballEvent.as::HumanStartsToMakeASnowballEvent()
    public constructor(human: HumanGameObject)
    {
        super();

        this._human = human;
    }

    // AS3: HumanStartsToMakeASnowballEvent.as::apply()
    public override apply(stage: SynchronizedGameStage): void
    {
        void stage;

        (this._human as HumanGameObject).startMakingSnowball();
    }

    // AS3: HumanStartsToMakeASnowballEvent.as::get human()
    public get human(): HumanGameObject | null
    {
        return this._human;
    }

    // AS3: HumanStartsToMakeASnowballEvent.as::dispose()
    public override dispose(): void
    {
        super.dispose();

        this._human = null;
    }
}

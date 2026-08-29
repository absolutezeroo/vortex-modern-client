import type {SynchronizedGameStage} from '../arena/SynchronizedGameStage';
import type {HumanGameObject} from '../gameobjects/HumanGameObject';
import {AbstractSynchronizedGameEvent} from './AbstractSynchronizedGameEvent';

/**
 * A player left.
 *
 * Both halves are needed and neither replaces the other: the stage is told to delete the object at
 * the end of the sub-turn, and `onRemove()` is called *now* so the tiles the player was holding are
 * released before anybody else tries to walk onto them.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/game/snowwar/events/HumanLeftGameEvent.as
 */
export class HumanLeftGameEvent extends AbstractSynchronizedGameEvent
{
    /** Derived name — `_SafeStr_6248`; the same field is `human` on the events that expose it. */
    // AS3: HumanLeftGameEvent.as::_SafeStr_6248
    private _human: HumanGameObject | null = null;

    // AS3: HumanLeftGameEvent.as::HumanLeftGameEvent()
    public constructor(human: HumanGameObject)
    {
        super();

        this._human = human;
    }

    // AS3: HumanLeftGameEvent.as::apply()
    public override apply(stage: SynchronizedGameStage): void
    {
        const human = this._human as HumanGameObject;

        stage.putGameObjectOnDeleteList(human);
        human.onRemove();
    }

    // AS3: HumanLeftGameEvent.as::dispose()
    public override dispose(): void
    {
        super.dispose();

        this._human = null;
    }
}

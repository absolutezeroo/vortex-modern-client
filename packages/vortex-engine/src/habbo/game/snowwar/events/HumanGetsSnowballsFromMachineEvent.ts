import {SnowWarEngine} from '../SnowWarEngine';

import type {SynchronizedGameStage} from '../arena/SynchronizedGameStage';
import type {HumanGameObject} from '../gameobjects/HumanGameObject';
import type {SnowballGivingGameObject} from '../gameobjects/SnowballGivingGameObject';
import {AbstractSynchronizedGameEvent} from './AbstractSynchronizedGameEvent';

/**
 * A player took a snowball from a pile or a machine.
 *
 * **One at a time**, however much room they have — the event asks for exactly 1 and the caller
 * repeats it. And the ghost is credited too: the player's own prediction is looked up by
 * `ghostObjectId` and given the same snowball, so the local view does not lag a turn behind its own
 * pickup.
 *
 * Nothing happens at all if the player is full or the source is empty, and neither case is an error.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/game/snowwar/events/HumanGetsSnowballsFromMachineEvent.as
 */
export class HumanGetsSnowballsFromMachineEvent extends AbstractSynchronizedGameEvent
{
    /** Derived name — `_SafeStr_6248`, from the `human` getter that reads it. */
    // AS3: HumanGetsSnowballsFromMachineEvent.as::_SafeStr_6248
    private _human: HumanGameObject | null = null;

    /** Derived name — `_SafeStr_7176`; a pile or a machine, whichever the player walked into. */
    // AS3: HumanGetsSnowballsFromMachineEvent.as::_SafeStr_7176
    private _snowballGiver: SnowballGivingGameObject | null = null;

    // AS3: HumanGetsSnowballsFromMachineEvent.as::HumanGetsSnowballsFromMachineEvent()
    public constructor(human: HumanGameObject, snowballGiver: SnowballGivingGameObject)
    {
        super();

        this._human = human;
        this._snowballGiver = snowballGiver;
    }

    // AS3: HumanGetsSnowballsFromMachineEvent.as::apply()
    public override apply(stage: SynchronizedGameStage): void
    {
        const human = this._human as HumanGameObject;
        const capacity = human.getRemainingSnowballCapacity();

        if(capacity > 0)
        {
            const taken = (this._snowballGiver as SnowballGivingGameObject).pickupSnowballs(1);

            if(taken > 0)
            {
                human.addSnowballs(taken);

                const ghost = stage.getGameObject(human.ghostObjectId) as HumanGameObject | null;

                if(ghost)
                {
                    ghost.addSnowballs(taken);
                }

                // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/game/snowwar/SnowWarEngine.as::playSound()
                SnowWarEngine.playSound('HBSTG_snowwar_get_snowball');
            }
        }
    }

    // AS3: HumanGetsSnowballsFromMachineEvent.as::get human()
    public get human(): HumanGameObject | null
    {
        return this._human;
    }

    // AS3: HumanGetsSnowballsFromMachineEvent.as::dispose()
    public override dispose(): void
    {
        super.dispose();

        this._human = null;
        this._snowballGiver = null;
    }
}

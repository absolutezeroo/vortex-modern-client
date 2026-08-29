import {Logger} from '@core/utils/Logger';

import type {SynchronizedGameStage} from '../arena/SynchronizedGameStage';
import type {SnowballMachineGameObject} from '../gameobjects/SnowballMachineGameObject';
import {AbstractSynchronizedGameEvent} from './AbstractSynchronizedGameEvent';

const log = Logger.getLogger('habbo.game.snowwar.events.MachineCreatesSnowballEvent');

/**
 * A machine topped itself up by one.
 *
 * The null branch is AS3's own and is kept: the server queues these from the moment the arena is
 * created, so a machine the client has not built yet can be named by an event that is already in the
 * queue. AS3 logs "Too early for this stuff.." and drops it, which stays in step because the machine
 * will be sent its real count with the next full status.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/game/snowwar/events/MachineCreatesSnowballEvent.as
 */
export class MachineCreatesSnowballEvent extends AbstractSynchronizedGameEvent
{
    /** Derived name — `_SafeStr_7176`; the same field is the giving object on the pickup event. */
    // AS3: MachineCreatesSnowballEvent.as::_SafeStr_7176
    private _machine: SnowballMachineGameObject | null = null;

    // AS3: MachineCreatesSnowballEvent.as::MachineCreatesSnowballEvent()
    public constructor(machine: SnowballMachineGameObject | null)
    {
        super();

        this._machine = machine;
    }

    // AS3: MachineCreatesSnowballEvent.as::apply()
    public override apply(stage: SynchronizedGameStage): void
    {
        void stage;

        if(this._machine)
        {
            this._machine.createSnowball();
        }
        else
        {
            log.warn('Too early for this stuff..');
        }
    }

    // AS3: MachineCreatesSnowballEvent.as::dispose()
    public override dispose(): void
    {
        super.dispose();

        this._machine = null;
    }
}

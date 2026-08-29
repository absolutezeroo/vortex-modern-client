import type {IDisposable} from '@core/runtime/IDisposable';

import type {SynchronizedGameStage} from './SynchronizedGameStage';

/**
 * One input, replayed against the stage.
 *
 * This is the client-side counterpart of `SnowWarGameEventData`: the DTO is what came off the wire,
 * an `ISynchronizedGameEvent` is that input turned into something the simulation can apply. The
 * arena queues them per (turn, sub-turn) and calls `apply()` in order — the order *is* the
 * determinism, so nothing here may depend on wall-clock time or on arrival order.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/game/snowwar/arena/ISynchronizedGameEvent.as
 */
export interface ISynchronizedGameEvent extends IDisposable
{
    // AS3: ISynchronizedGameEvent.as::apply()
    apply(stage: SynchronizedGameStage): void;
}

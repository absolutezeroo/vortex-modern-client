import type {IDisposable} from '@core/runtime/IDisposable';

import type {IGameStage} from './IGameStage';
import type {SynchronizedGameArena} from './SynchronizedGameArena';

/**
 * The per-game half of the arena.
 *
 * `SynchronizedGameArena` is generic lock-step plumbing: it knows about turns, sub-turns, an event
 * queue and a checksum, and nothing about snow. Everything a specific game has to decide — how long
 * a pulse is, how many sub-turns make a turn, what kind of stage to build — comes through here.
 * `SnowWarArenaExtension` is the only implementor in this build.
 *
 * **It has to be set before `initialize()`**, because `initialize()` sizes its first event queue
 * from `getNumberOfSubTurns()`, which asks the extension. `SnowWarEngine` does exactly that:
 * `new SynchronizedGameArena()`, `setExtension(...)`, then `initialize(...)`.
 *
 * **The name is derived.** `_SafeCls_3121` in the primary tree, `_SafeStr_4033` in the 2016 one —
 * obfuscated in both. AS3 names the *concept* itself, though: the arena's accessors are
 * `getExtension()`/`setExtension()` and the 2016 field is `_extension`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/game/snowwar/arena/_SafeCls_3121.as
 */
export interface IGameArenaExtension extends IDisposable
{
    // AS3: _SafeCls_3121.as::createGameStage()
    createGameStage(): IGameStage;

    // AS3: _SafeCls_3121.as::set gameArena()
    gameArena: SynchronizedGameArena | null;

    // AS3: _SafeCls_3121.as::pulse()
    pulse(): void;

    // AS3: _SafeCls_3121.as::getPulseInterval()
    getPulseInterval(): number;

    // AS3: _SafeCls_3121.as::getNumberOfSubTurns()
    getNumberOfSubTurns(): number;
}

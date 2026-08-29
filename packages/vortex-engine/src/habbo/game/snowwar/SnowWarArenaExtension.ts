import type {IGameArenaExtension} from './arena/IGameArenaExtension';
import type {IGameStage} from './arena/IGameStage';
import type {SynchronizedGameArena} from './arena/SynchronizedGameArena';

/**
 * Snow War's answers to the four questions the generic arena cannot answer itself: a pulse every
 * 50 ms, three sub-turns to a turn, a snow-war stage, and nothing to do on its own pulse.
 *
 * Those two numbers are the game's clock and are shared with the server — a turn is 150 ms, and
 * every input the server timestamps is expressed in turns, so changing either desynchronises
 * everything at once.
 *
 * `isDeathMatch()` is not on the interface: `HumanGameObject` casts the extension to this class to
 * ask it, which is how a one-team game turns friendly fire on.
 *
 * **The name is derived.** `_SafeCls_3122` in the primary tree, `_SafeStr_4034` in the 2016 one —
 * obfuscated in both. It is named for what it is: the snow-war implementation of
 * `IGameArenaExtension`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/game/snowwar/_SafeCls_3122.as
 */
export class SnowWarArenaExtension implements IGameArenaExtension
{
    /** Derived name — `_SafeStr_4646`, from the `gameArena` setter that writes it. */
    // AS3: _SafeCls_3122.as::_SafeStr_4646
    private _gameArena: SynchronizedGameArena | null = null;

    /** Derived name — `_SafeStr_5769`, from the `disposed` getter that reads it. */
    // AS3: _SafeCls_3122.as::_SafeStr_5769
    private _disposed: boolean = false;

    /**
     * Write-only in AS3, which declares the setter and no getter. The port adds the getter because
     * `IGameArenaExtension` cannot express a setter alone; it reads back what was set and nothing
     * in AS3 depends on it being absent.
     */
    // AS3: _SafeCls_3122.as::set gameArena()
    public get gameArena(): SynchronizedGameArena | null
    {
        return this._gameArena;
    }

    // AS3: _SafeCls_3122.as::set gameArena()
    public set gameArena(gameArena: SynchronizedGameArena | null)
    {
        this._gameArena = gameArena;
    }

    /** Milliseconds between pulses. One turn is this times `getNumberOfSubTurns()`. */
    // AS3: _SafeCls_3122.as::getPulseInterval()
    public getPulseInterval(): number
    {
        return 50;
    }

    // AS3: _SafeCls_3122.as::getNumberOfSubTurns()
    public getNumberOfSubTurns(): number
    {
        return 3;
    }

    /**
     * Dead in this build: `SynchronizedGameArena.initialize()` builds its stage with a direct `new`
     * and never asks the extension, and no other caller exists in any tree. Kept because it is on
     * the interface.
     */
    // TODO(AS3): sources/WIN63-202607011411-782849652/src/com/sulake/habbo/game/snowwar/_SafeCls_2604.as
    //   AS3 returns `new SnowWarGameStage()`. That class is unported — it needs `Tile` and the
    //   `gameobjects/` tier — so this throws rather than handing back something that is not a stage.
    // AS3: _SafeCls_3122.as::createGameStage()
    public createGameStage(): IGameStage
    {
        throw new Error('SnowWarGameStage is not ported yet');
    }

    /** Empty in AS3: the extension has no per-pulse work of its own. */
    // AS3: _SafeCls_3122.as::pulse()
    public pulse(): void
    {
    }

    /** With one team there are no allies, so everybody is a target. */
    // AS3: _SafeCls_3122.as::isDeathMatch()
    public isDeathMatch(): boolean
    {
        return this._gameArena?.numberOfTeams === 1;
    }

    // AS3: _SafeCls_3122.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: _SafeCls_3122.as::dispose()
    public dispose(): void
    {
        this._disposed = true;
        this._gameArena = null;
    }
}

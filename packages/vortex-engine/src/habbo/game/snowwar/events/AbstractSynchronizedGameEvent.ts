import type {ISynchronizedGameEvent} from '../arena/ISynchronizedGameEvent';
import type {SynchronizedGameStage} from '../arena/SynchronizedGameStage';

/**
 * Base of the eight replayable inputs.
 *
 * It carries nothing but a disposed flag: an event is a verb, not a record, and everything it needs
 * is captured in its constructor as **direct references to the game objects involved** rather than
 * as ids to look up. That is what makes `apply()` a couple of lines each — and what makes disposal
 * matter, since a queued event pins the objects it names.
 *
 * **The name is derived.** `_SafeCls_2596` in the primary tree, `_SafeStr_4020` in the 2016 one —
 * obfuscated in both. Named for what it is: the abstract base of `ISynchronizedGameEvent`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/game/snowwar/events/_SafeCls_2596.as
 */
export class AbstractSynchronizedGameEvent implements ISynchronizedGameEvent
{
    /** Derived name — `_SafeStr_5769`, from the `disposed` getter that reads it. */
    // AS3: _SafeCls_2596.as::_SafeStr_5769
    private _disposed: boolean = false;

    // AS3: _SafeCls_2596.as::apply()
    public apply(stage: SynchronizedGameStage): void
    {
        void stage;
    }

    // AS3: _SafeCls_2596.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: _SafeCls_2596.as::dispose()
    public dispose(): void
    {
        this._disposed = true;
    }
}

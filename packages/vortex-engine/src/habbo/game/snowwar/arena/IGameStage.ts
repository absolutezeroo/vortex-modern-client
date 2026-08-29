import type {GameLevelData} from '@habbo/communication/messages/parser/game/snowwar/data/GameLevelData';
import type {IDisposable} from '@core/runtime/IDisposable';

import type {SynchronizedGameArena} from './SynchronizedGameArena';

/**
 * The arena's view of a stage: something that can be handed a level and knows which arena it
 * belongs to.
 *
 * Deliberately narrow — the arena drives the simulation through `SynchronizedGameStage`, and this
 * interface exists only so `IGameArenaExtension.createGameStage()` has a return type that does not
 * name the concrete class.
 *
 * **The name is derived.** The class is `_SafeCls_2602` in the primary tree and `_SafeStr_4024` in
 * the 2016 one — obfuscated in every tree that carries it, so there is nothing to recover. It is
 * named after `DefaultGameStage`, its only implementor.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/game/snowwar/arena/_SafeCls_2602.as
 */
export interface IGameStage extends IDisposable
{
    // AS3: _SafeCls_2602.as::initialize()
    initialize(gameArena: SynchronizedGameArena, gameLevelData: GameLevelData): void;

    // AS3: _SafeCls_2602.as::get gameArena()
    readonly gameArena: SynchronizedGameArena | null;

    // AS3: _SafeCls_2602.as::get roomType()
    readonly roomType: string;
}

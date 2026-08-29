import type {GameLevelData} from '@habbo/communication/messages/parser/game/snowwar/data/GameLevelData';

import type {IGameStage} from './IGameStage';
import type {SynchronizedGameArena} from './SynchronizedGameArena';

/**
 * Two references and a disposed flag — the whole base stage.
 *
 * It is a class rather than a default implementation folded into `SynchronizedGameStage` because
 * `roomType` is the one thing a stage answers without any simulation, and AS3 puts the empty answer
 * here so a game that has no room type inherits it.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/game/snowwar/arena/DefaultGameStage.as
 */
export class DefaultGameStage implements IGameStage
{
    /** Derived name — `_SafeStr_4646`, from the `gameArena` getter that reads it. */
    // AS3: DefaultGameStage.as::_SafeStr_4646
    protected _gameArena: SynchronizedGameArena | null = null;

    /** Derived name — `_SafeStr_7809`, from the `gameLevelData` getter that reads it. */
    // AS3: DefaultGameStage.as::_SafeStr_7809
    protected _gameLevelData: GameLevelData | null = null;

    /** Derived name — `_SafeStr_5769`, from the `disposed` getter that reads it. */
    // AS3: DefaultGameStage.as::_SafeStr_5769
    private _disposed: boolean = false;

    // AS3: DefaultGameStage.as::initialize()
    public initialize(gameArena: SynchronizedGameArena, gameLevelData: GameLevelData): void
    {
        this._gameArena = gameArena;
        this._gameLevelData = gameLevelData;
    }

    // AS3: DefaultGameStage.as::get gameArena()
    public get gameArena(): SynchronizedGameArena | null
    {
        return this._gameArena;
    }

    // AS3: DefaultGameStage.as::get gameLevelData()
    public get gameLevelData(): GameLevelData | null
    {
        return this._gameLevelData;
    }

    /**
     * Empty here on purpose — a stage that maps to no room type says so with the empty string, and
     * only a subclass that lives in a room overrides it.
     */
    // AS3: DefaultGameStage.as::get roomType()
    public get roomType(): string
    {
        return '';
    }

    // AS3: DefaultGameStage.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: DefaultGameStage.as::dispose()
    public dispose(): void
    {
        this._disposed = true;
        this._gameArena = null;
        this._gameLevelData = null;
    }
}

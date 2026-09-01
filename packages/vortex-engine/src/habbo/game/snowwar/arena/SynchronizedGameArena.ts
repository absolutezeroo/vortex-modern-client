import {LogLevel, Logger} from '@core/utils/Logger';
import {OrderedMap} from '@core/utils/OrderedMap';
import type {IDisposable} from '@core/runtime/IDisposable';

import {SnowWarGameStage} from '../SnowWarGameStage';
import type {SnowWarEngine} from '../SnowWarEngine';
import type {IGameArenaExtension} from './IGameArenaExtension';
import type {ISynchronizedGameEvent} from './ISynchronizedGameEvent';
import type {SynchronizedGameStage} from './SynchronizedGameStage';

const log = Logger.getLogger('habbo.game.snowwar.arena.SynchronizedGameArena');

/**
 * The lock-step clock.
 *
 * It owns three things and no game rules: a turn counter split into sub-turns, a queue of events
 * indexed by *(turn, sub-turn)*, and a checksum per turn. `gamePulse()` is the only entry point —
 * it drains the current sub-turn's queue, advances every object once, and at the end of a turn
 * records the checksum the server will be compared against. Everything snow-specific arrives
 * through `IGameArenaExtension`.
 *
 * **Set the extension before calling `initialize()`.** `initialize()` sizes its first event queue
 * from `getNumberOfSubTurns()`, which asks the extension; `SnowWarEngine` does
 * `new SynchronizedGameArena()`, `setExtension(...)`, `initialize(...)` in that order.
 *
 * `_events` is a sparse array keyed by turn number, not a list — a turn nobody queued anything for
 * is a hole, and `addGameEvent()` fills it on demand. That is what lets the server queue an input
 * several turns ahead of the one being simulated.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/game/snowwar/arena/SynchronizedGameArena.as
 */
export class SynchronizedGameArena implements IDisposable
{
    /**
     * Derived name — `_SafeStr_4581`, from the `gameEngine` getter that reads it. The 2016 tree
     * calls the same field `_snowWarEngine`, but that build's getter is `snowWarEngine`; this one's
     * is `gameEngine`.
     */
    // AS3: SynchronizedGameArena.as::_SafeStr_4581
    private _gameEngine: SnowWarEngine | null = null;

    /** Name recovered from the 2016 tree — `_SafeStr_5325` in the primary. */
    // AS3: SynchronizedGameArena.as::_SafeStr_5325
    private _events: ISynchronizedGameEvent[][][] = [];

    /** Name recovered from the 2016 tree, where it is `protected var turn` — `_SafeStr_4958` here. */
    // AS3: SynchronizedGameArena.as::_SafeStr_4958
    protected _turn: number = 0;

    /** Name recovered from the 2016 tree — `_SafeStr_5083` in the primary. */
    // AS3: SynchronizedGameArena.as::_SafeStr_5083
    private _subturn: number = 0;

    /**
     * Derived name — `_SafeStr_10327` here, `_SafeStr_19001` in 2016, obfuscated in both. It is the
     * interval `gamePulse()` tests the turn against before recording a checksum, and it is 1, so a
     * checksum is recorded on every turn.
     */
    // AS3: SynchronizedGameArena.as::_SafeStr_10327
    private _checksumInterval: number = 1;

    /** Name recovered from the 2016 tree — `_SafeStr_8207` in the primary. */
    // AS3: SynchronizedGameArena.as::_SafeStr_8207
    private _synchronizedGameStage: SynchronizedGameStage | null = null;

    /** Name recovered from the 2016 tree — `_SafeStr_6366` in the primary. */
    // AS3: SynchronizedGameArena.as::_SafeStr_6366
    private _extension: IGameArenaExtension | null = null;

    // AS3: SynchronizedGameArena.as::_checkSums
    private _checkSums: OrderedMap<number, number> | null = null;

    /** Name recovered from the 2016 tree — `_SafeStr_5769` in the primary. */
    // AS3: SynchronizedGameArena.as::_SafeStr_5769
    private _disposed: boolean = false;

    /**
     * Name recovered from the 2016 tree — `_SafeStr_8345` in the primary.
     *
     * Set by `seekToTurn()` and cleared only where the turn closes, so it suppresses `subturn()` for
     * **every sub-turn of that whole turn**, not just the next pulse: a client that has just been
     * told where the server is applies that turn's events without advancing objects it has not
     * received yet, and starts simulating again on the following turn.
     */
    // AS3: SynchronizedGameArena.as::_SafeStr_8345
    private _newTurn: boolean = false;

    // AS3: SynchronizedGameArena.as::_numberOfTeams
    private _numberOfTeams: number = 0;

    // AS3: SynchronizedGameArena.as::_teamScores
    private _teamScores: number[] = [];

    // AS3: SynchronizedGameArena.as::initialize()
    public initialize(gameEngine: SnowWarEngine | null, numberOfTeams: number): void
    {
        this._gameEngine = gameEngine;

        // The generic arena naming a snow-war class is AS3's own layering break, not the port's:
        // `initialize()` builds the stage with a direct `new` and never asks `createGameStage()`.
        this._synchronizedGameStage = new SnowWarGameStage();

        this._checkSums = new OrderedMap<number, number>();
        this._events = [];
        this._numberOfTeams = numberOfTeams;
        this._turn = 0;
        this._subturn = 0;
        this._events[this._turn] = this.initEmptyEventQueue();
        this._checkSums = new OrderedMap<number, number>();
        this.resetTeamScores();
    }

    // AS3: SynchronizedGameArena.as::get gameEngine()
    public get gameEngine(): SnowWarEngine | null
    {
        return this._gameEngine;
    }

    // AS3: SynchronizedGameArena.as::pulse()
    public pulse(): void
    {
        this.gamePulse();
    }

    /**
     * One sub-turn: apply what was queued for it, advance the objects, and close the turn if this
     * was its last sub-turn.
     *
     * The queue is drained with `shift()` while it is non-empty rather than iterated, because
     * `apply()` may itself queue an event — into a *later* turn, never this one.
     */
    // AS3: SynchronizedGameArena.as::gamePulse()
    public gamePulse(): void
    {
        const stage = this.getCurrentStage();

        if(log.isEnabled(LogLevel.TRACE))
        {
            log.trace(`Turn ${this._turn} subturn ${this._subturn + 1}/${this.getNumberOfSubTurns()}`);
        }

        if(stage === null)
        {
            // AS3 cannot reach this: `initialize()` always assigns a stage. The port guards because
            // the field is null until then, and pulsing an uninitialised arena is a caller error.
            log.warn('gamePulse() before initialize(); the arena has no stage.');

            return;
        }

        const turnQueue = this._events[this._turn];

        if(turnQueue)
        {
            const queue = turnQueue[this._subturn];

            while(queue.length > 0)
            {
                const event = queue.shift() as ISynchronizedGameEvent;

                if(log.isEnabled(LogLevel.TRACE))
                {
                    log.trace(`GameInstance::gameTurn: applying event ${String(event)} turn ${this._turn} subturn ${this._subturn + 1}/${this.getNumberOfSubTurns()}`);
                }

                event.apply(stage);
            }
        }

        if(!this._newTurn)
        {
            stage.subturn();
        }

        if(this._subturn >= this.getNumberOfSubTurns() - 1)
        {
            if(this._turn % this._checksumInterval === 0)
            {
                this._checkSums?.setValue(this._turn, stage.calculateChecksum(this._turn));
            }

            this._turn = this._turn + 1;
            this._newTurn = false;

            if(log.isEnabled(LogLevel.TRACE))
            {
                log.trace(`Turn:${this._turn}`);
            }
        }

        this._subturn = this._subturn + 1;

        if(this._subturn >= this.getNumberOfSubTurns())
        {
            this._subturn = 0;
        }
    }

    // AS3: SynchronizedGameArena.as::addGameEvent()
    public addGameEvent(turn: number, subturn: number, event: ISynchronizedGameEvent): void
    {
        let turnQueue = this._events[turn];

        if(turnQueue === undefined)
        {
            turnQueue = this.initEmptyEventQueue();
            this._events[turn] = turnQueue;
        }

        turnQueue[subturn].push(event);

        if(log.isEnabled(LogLevel.TRACE))
        {
            log.trace(`Add game event: ${String(event)} (subturn/turn): ${subturn}/${turn}`);
        }
    }

    // AS3: SynchronizedGameArena.as::debugEventQueue()
    public debugEventQueue(): void
    {
        let report = '';
        let turn = 0;

        while(turn < this._events.length)
        {
            const turnQueue = this._events[turn];

            if(turnQueue !== undefined)
            {
                let subturn = 0;

                while(subturn < this.getNumberOfSubTurns())
                {
                    const queue = turnQueue[subturn];

                    if(queue.length !== 0)
                    {
                        report += `${turn} (${subturn}) : `;

                        for(const event of queue)
                        {
                            report += String(event);
                        }

                        report += '\n';
                    }

                    subturn++;
                }
            }

            turn++;
        }

        log.trace(report);
    }

    // AS3: SynchronizedGameArena.as::getNumberOfSubTurns()
    public getNumberOfSubTurns(): number
    {
        return this.getExtension()?.getNumberOfSubTurns() ?? 0;
    }

    // AS3: SynchronizedGameArena.as::getTurnNumber()
    public getTurnNumber(): number
    {
        return this._turn;
    }

    // AS3: SynchronizedGameArena.as::get subturn()
    public get subturn(): number
    {
        return this._subturn;
    }

    // AS3: SynchronizedGameArena.as::getCurrentStage()
    public getCurrentStage(): SynchronizedGameStage | null
    {
        return this._synchronizedGameStage;
    }

    // AS3: SynchronizedGameArena.as::getExtension()
    public getExtension(): IGameArenaExtension | null
    {
        return this._extension;
    }

    // AS3: SynchronizedGameArena.as::setExtension()
    public setExtension(extension: IGameArenaExtension): void
    {
        this._extension = extension;
        extension.gameArena = this;
    }

    // AS3: SynchronizedGameArena.as::getCheckSum()
    public getCheckSum(turn: number): number
    {
        return this._checkSums?.getValue(turn) ?? 0;
    }

    /**
     * Jumps the simulation to a turn the server has already reached, trusting its checksum and
     * throwing away every queued event. `_newTurn` then holds `stage.subturn()` off for the rest of
     * that turn, so the pulses after a seek apply the incoming events without advancing anything
     * twice.
     */
    // AS3: SynchronizedGameArena.as::seekToTurn()
    public seekToTurn(turn: number, checkSum: number): void
    {
        this._turn = turn;
        this._subturn = 0;
        this._checkSums?.setValue(turn, checkSum);
        this._events = [];
        this._events[this._turn] = this.initEmptyEventQueue();
        this._newTurn = true;
    }

    // AS3: SynchronizedGameArena.as::initEmptyEventQueue()
    private initEmptyEventQueue(): ISynchronizedGameEvent[][]
    {
        const queues: ISynchronizedGameEvent[][] = [];
        let index = 0;

        while(index < this.getNumberOfSubTurns())
        {
            queues[index] = [];
            index++;
        }

        return queues;
    }

    // AS3: SynchronizedGameArena.as::get numberOfTeams()
    public get numberOfTeams(): number
    {
        return this._numberOfTeams;
    }

    // AS3: SynchronizedGameArena.as::resetTeamScores()
    private resetTeamScores(): void
    {
        this._teamScores = [];

        let index = 0;

        while(index < this._numberOfTeams)
        {
            this._teamScores[index] = 0;
            index++;
        }
    }

    /**
     * Teams are 1-based on the wire and 0-based in the array, and a score for team 0 or for a team
     * past the count is silently dropped — AS3 guards rather than throwing.
     */
    // AS3: SynchronizedGameArena.as::addTeamScore()
    public addTeamScore(team: number, score: number): void
    {
        if(team > 0 && team <= this._numberOfTeams)
        {
            const index = team - 1;

            this._teamScores[index] = this._teamScores[index] + score;
        }
    }

    // AS3: SynchronizedGameArena.as::getTeamScores()
    public getTeamScores(): number[]
    {
        return this._teamScores;
    }

    // AS3: SynchronizedGameArena.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }

    /**
     * Disposes the extension and drops everything else. The stage is *not* disposed — AS3 only nulls
     * the reference, because whoever built it (the engine) owns it.
     */
    // AS3: SynchronizedGameArena.as::dispose()
    public dispose(): void
    {
        this._disposed = true;
        this._gameEngine = null;
        // AS3 nulls this field; the port empties it instead, which releases the same references
        // without making a private array nullable everywhere it is read.
        this._events = [];
        this._synchronizedGameStage = null;

        if(this._extension !== null)
        {
            this._extension.dispose();
            this._extension = null;
        }

        this._checkSums = null;
    }
}

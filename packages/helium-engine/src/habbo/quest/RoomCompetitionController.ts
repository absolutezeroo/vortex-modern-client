import type {IDisposable} from '@core/runtime';
import type {HabboQuestEngine} from './HabboQuestEngine';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('RoomCompetitionController');

/**
 * Room competition controller
 *
 * Manages room competition voting and submission flow.
 * VIEW logic is handled by SolidJS.
 *
 * @see source_as_win63/habbo/quest/RoomCompetitionController.as
 */
export class RoomCompetitionController implements IDisposable
{
    private _engine: HabboQuestEngine | null;

    constructor(engine: HabboQuestEngine)
    {
        this._engine = engine;
    }

    private _goalCode: string = '';

    /**
	 * Get the goal code
	 */
    get goalCode(): string
    {
        return this._goalCode;
    }

    private _goalId: number = 0;

    /**
	 * Get the goal ID
	 */
    get goalId(): number
    {
        return this._goalId;
    }

    private _votesRemaining: number = 0;

    /**
	 * Get remaining votes
	 */
    get votesRemaining(): number
    {
        return this._votesRemaining;
    }

    private _isSubmitMode: boolean = false;

    /**
	 * Whether the controller is in submit mode
	 */
    get isSubmitMode(): boolean
    {
        return this._isSubmitMode;
    }

    private _dontShowAgain: boolean = false;

    /**
	 * Set whether to suppress competition window display
	 */
    set dontShowAgain(value: boolean)
    {
        this._dontShowAgain = value;
    }

    private _disposed: boolean = false;

    get disposed(): boolean
    {
        return this._disposed;
    }

    /**
	 * Handle competition voting info from server
	 *
	 * @param goalId The competition goal ID
	 * @param goalCode The competition goal code
	 * @param votesRemaining Number of votes remaining
	 * @param isAllowed Whether voting is allowed for this user
	 */
    onCompetitionVotingInfo(goalId: number, goalCode: string, votesRemaining: number, isAllowed: boolean): void
    {
        this._goalId = goalId;
        this._goalCode = goalCode;
        this._votesRemaining = votesRemaining;

        log.debug(`Competition voting info: goalId=${goalId}, goalCode=${goalCode}, votesRemaining=${votesRemaining}, allowed=${isAllowed}`);
    }

    /**
	 * Handle competition entry submit result
	 *
	 * @param result The result code
	 * @param category The competition category
	 * @param doorId The door ID
	 */
    onCompetitionEntrySubmitResult(result: number, category: string, doorId: number): void
    {
        log.debug(`Competition entry submit result: result=${result}, category=${category}, doorId=${doorId}`);
    }

    /**
	 * Handle room entry
	 *
	 * @param roomId The room ID entered
	 */
    onRoomEnter(roomId: number): void
    {
        if(!this._dontShowAgain && this._engine)
        {
            log.debug(`Room competition: room entered ${roomId}`);
        }
    }

    /**
	 * Handle room exit
	 */
    onRoomExit(): void
    {
        this._goalCode = '';
        log.debug('Room competition: room exited');
    }

    /**
	 * Handle room context changes (furniture added/removed, settings saved)
	 */
    onContextChanged(): void
    {
        log.debug('Room competition: context changed');
    }

    /**
	 * Send the room competition init message
	 */
    sendRoomCompetitionInit(): void
    {
        log.debug('Sending room competition init');
    }

    /**
	 * Dispose of this controller and release resources
	 */
    dispose(): void
    {
        if(this._disposed) return;

        this._engine = null;
        this._disposed = true;
    }
}

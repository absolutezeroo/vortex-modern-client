import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';
import {
    Game2GetWeeklyGroupLeaderboardComposer
} from '@habbo/communication/messages/outgoing/game/score/Game2GetWeeklyGroupLeaderboardComposer';
import type {SnowWarEngine} from '../SnowWarEngine';
import {TotalGroupLeaderboardTable} from './TotalGroupLeaderboardTable';

/**
 * The weekly group board — `TotalGroupLeaderboardTable` plus the same week offset the weekly hotel
 * board carries.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/game/snowwar/leaderboard/WeeklyGroupLeaderboardTable.as
 */
export class WeeklyGroupLeaderboardTable extends TotalGroupLeaderboardTable
{
    // AS3: WeeklyGroupLeaderboardTable.as::_offset
    private _offset: number = 0;

    /** Derived name — `_SafeStr_7825`, the ceiling the `offset` setter clamps against. */
    // AS3: WeeklyGroupLeaderboardTable.as::_SafeStr_7825
    private _maxOffset: number = 0;

    // AS3: WeeklyGroupLeaderboardTable.as::WeeklyGroupLeaderboardTable()
    constructor(engine: SnowWarEngine)
    {
        super(engine);
    }

    // AS3: WeeklyGroupLeaderboardTable.as::get offset()
    public get offset(): number
    {
        return this._offset;
    }

    // AS3: WeeklyGroupLeaderboardTable.as::set offset()
    public set offset(offset: number)
    {
        if(offset >= 0 && offset <= this._maxOffset)
        {
            this._offset = offset;
        }
    }

    // AS3: WeeklyGroupLeaderboardTable.as::get maxOffset()
    public get maxOffset(): number
    {
        return this._maxOffset;
    }

    // AS3: WeeklyGroupLeaderboardTable.as::set maxOffset()
    public set maxOffset(maxOffset: number)
    {
        this._maxOffset = maxOffset;
    }

    // AS3: WeeklyGroupLeaderboardTable.as::getMessageComposer()
    protected override getMessageComposer(gameId: number, rank: number, scrollDirection: number): IMessageComposer<number[]>
    {
        return new Game2GetWeeklyGroupLeaderboardComposer(
            gameId,
            this._offset,
            rank,
            scrollDirection,
            this._viewSize,
            this._windowSize
        );
    }
}

import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';
import {
    Game2GetWeeklyLeaderboardComposer
} from '@habbo/communication/messages/outgoing/game/score/Game2GetWeeklyLeaderboardComposer';
import type {SnowWarEngine} from '../SnowWarEngine';
import {TotalLeaderboardTable} from './TotalLeaderboardTable';

/**
 * The weekly hotel board: the all-time one plus a week offset, `0` being this week.
 *
 * The setter refuses anything outside `0..maxOffset` silently — the arrows that drive it are
 * enabled off the same two numbers, so a rejected write means the view and the table disagreed,
 * not that the user asked for something impossible.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/game/snowwar/leaderboard/WeeklyTotalLeaderboardTable.as
 */
export class WeeklyTotalLeaderboardTable extends TotalLeaderboardTable
{
    // AS3: WeeklyTotalLeaderboardTable.as::_offset
    private _offset: number = 0;

    /** Derived name — `_SafeStr_7825`, the ceiling the `offset` setter clamps against. */
    // AS3: WeeklyTotalLeaderboardTable.as::_SafeStr_7825
    private _maxOffset: number = 0;

    // AS3: WeeklyTotalLeaderboardTable.as::WeeklyTotalLeaderboardTable()
    constructor(engine: SnowWarEngine)
    {
        super(engine);
    }

    // AS3: WeeklyTotalLeaderboardTable.as::get offset()
    public get offset(): number
    {
        return this._offset;
    }

    // AS3: WeeklyTotalLeaderboardTable.as::set offset()
    public set offset(offset: number)
    {
        if(offset >= 0 && offset <= this._maxOffset)
        {
            this._offset = offset;
        }
    }

    // AS3: WeeklyTotalLeaderboardTable.as::get maxOffset()
    public get maxOffset(): number
    {
        return this._maxOffset;
    }

    // AS3: WeeklyTotalLeaderboardTable.as::set maxOffset()
    public set maxOffset(maxOffset: number)
    {
        this._maxOffset = maxOffset;
    }

    // AS3: WeeklyTotalLeaderboardTable.as::getMessageComposer()
    protected override getMessageComposer(gameId: number, rank: number, scrollDirection: number): IMessageComposer<number[]>
    {
        return new Game2GetWeeklyLeaderboardComposer(
            gameId,
            this._offset,
            rank,
            scrollDirection,
            this._viewSize,
            this._windowSize
        );
    }
}

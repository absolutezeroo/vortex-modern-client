import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';
import {
    Game2GetWeeklyFriendsLeaderboardComposer
} from '@habbo/communication/messages/outgoing/game/score/Game2GetWeeklyFriendsLeaderboardComposer';
import type {SnowWarEngine} from '../SnowWarEngine';
import {LeaderboardTable} from './LeaderboardTable';

/**
 * The weekly friends board. Unlike the two "total" weeklies this one derives straight from
 * `LeaderboardTable`: a friends page has no pinned own row, so it keeps the full `viewSize` and the
 * centre-on-yourself behaviour.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/game/snowwar/leaderboard/WeeklyFriendLeaderboardTable.as
 */
export class WeeklyFriendLeaderboardTable extends LeaderboardTable
{
    // AS3: WeeklyFriendLeaderboardTable.as::_offset
    private _offset: number = 0;

    /** Derived name — `_SafeStr_7825`, the ceiling the `offset` setter clamps against. */
    // AS3: WeeklyFriendLeaderboardTable.as::_SafeStr_7825
    private _maxOffset: number = 0;

    // AS3: WeeklyFriendLeaderboardTable.as::WeeklyFriendLeaderboardTable()
    constructor(engine: SnowWarEngine)
    {
        super(engine);
    }

    // AS3: WeeklyFriendLeaderboardTable.as::get offset()
    public get offset(): number
    {
        return this._offset;
    }

    // AS3: WeeklyFriendLeaderboardTable.as::set offset()
    public set offset(offset: number)
    {
        if(offset >= 0 && offset <= this._maxOffset)
        {
            this._offset = offset;
        }
    }

    // AS3: WeeklyFriendLeaderboardTable.as::get maxOffset()
    public get maxOffset(): number
    {
        return this._maxOffset;
    }

    // AS3: WeeklyFriendLeaderboardTable.as::set maxOffset()
    public set maxOffset(maxOffset: number)
    {
        this._maxOffset = maxOffset;
    }

    // AS3: WeeklyFriendLeaderboardTable.as::getMessageComposer()
    protected override getMessageComposer(gameId: number, rank: number, scrollDirection: number): IMessageComposer<number[]>
    {
        return new Game2GetWeeklyFriendsLeaderboardComposer(
            gameId,
            this._offset,
            rank,
            scrollDirection,
            this._viewSize,
            this._windowSize
        );
    }
}

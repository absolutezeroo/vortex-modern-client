import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {Game2LeaderboardParser} from './Game2LeaderboardParser';

/**
 * The weekly group board: the five weekly fields first, then the rows, then the favourite group id
 * **after** them.
 *
 * It extends the plain leaderboard parser and not the group one — AS3 does the same, which is why
 * `favouriteGroupId` is declared here a second time rather than inherited.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_4040/Game2WeeklyGroupLeaderboardParser.as
 */
export class Game2WeeklyGroupLeaderboardParser extends Game2LeaderboardParser
{
    // AS3: Game2WeeklyGroupLeaderboardParser.as::_SafeStr_7611
    private _year: number = -1;

    // AS3: Game2WeeklyGroupLeaderboardParser.as::_SafeStr_7933
    private _week: number = -1;

    // AS3: Game2WeeklyGroupLeaderboardParser.as::_SafeStr_7825
    private _maxOffset: number = -1;

    // AS3: Game2WeeklyGroupLeaderboardParser.as::_SafeStr_8052
    private _currentOffset: number = -1;

    // AS3: Game2WeeklyGroupLeaderboardParser.as::_SafeStr_7597
    private _minutesUntilReset: number = -1;

    // AS3: Game2WeeklyGroupLeaderboardParser.as::_SafeStr_7524
    private _favouriteGroupId: number = -1;

    // AS3: Game2WeeklyGroupLeaderboardParser.as::get year()
    get year(): number
    {
        return this._year;
    }

    // AS3: Game2WeeklyGroupLeaderboardParser.as::get week()
    get week(): number
    {
        return this._week;
    }

    // AS3: Game2WeeklyGroupLeaderboardParser.as::get maxOffset()
    get maxOffset(): number
    {
        return this._maxOffset;
    }

    // AS3: Game2WeeklyGroupLeaderboardParser.as::get currentOffset()
    get currentOffset(): number
    {
        return this._currentOffset;
    }

    // AS3: Game2WeeklyGroupLeaderboardParser.as::get minutesUntilReset()
    get minutesUntilReset(): number
    {
        return this._minutesUntilReset;
    }

    // AS3: Game2WeeklyGroupLeaderboardParser.as::get favouriteGroupId()
    get favouriteGroupId(): number
    {
        return this._favouriteGroupId;
    }

    // AS3: Game2WeeklyGroupLeaderboardParser.as::flush()
    override flush(): boolean
    {
        this._year = -1;
        this._week = -1;
        this._maxOffset = -1;
        this._currentOffset = -1;
        this._minutesUntilReset = -1;
        this._favouriteGroupId = -1;

        return super.flush();
    }

    // AS3: Game2WeeklyGroupLeaderboardParser.as::parse()
    override parse(wrapper: IMessageDataWrapper): boolean
    {
        this._year = wrapper.readInt();
        this._week = wrapper.readInt();
        this._maxOffset = wrapper.readInt();
        this._currentOffset = wrapper.readInt();
        this._minutesUntilReset = wrapper.readInt();

        super.parse(wrapper);

        this._favouriteGroupId = wrapper.readInt();

        return true;
    }
}

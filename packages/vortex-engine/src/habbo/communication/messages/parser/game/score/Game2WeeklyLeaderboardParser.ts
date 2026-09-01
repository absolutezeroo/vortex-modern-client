import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {Game2LeaderboardParser} from './Game2LeaderboardParser';

/**
 * A weekly leaderboard page: which week it is, how far back the archive goes, how long until the
 * board resets — then the same rows the all-time parser reads.
 *
 * The five weekly fields come **before** the rows on the wire, which is why `parse()` reads them
 * and only then calls the base.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_4040/Game2WeeklyLeaderboardParser.as
 */
export class Game2WeeklyLeaderboardParser extends Game2LeaderboardParser
{
    // AS3: Game2WeeklyLeaderboardParser.as::_SafeStr_7611
    private _year: number = -1;

    // AS3: Game2WeeklyLeaderboardParser.as::_SafeStr_7933
    private _week: number = -1;

    // AS3: Game2WeeklyLeaderboardParser.as::_SafeStr_7825
    private _maxOffset: number = -1;

    // AS3: Game2WeeklyLeaderboardParser.as::_SafeStr_8052
    private _currentOffset: number = -1;

    // AS3: Game2WeeklyLeaderboardParser.as::_SafeStr_7597
    private _minutesUntilReset: number = -1;

    // AS3: Game2WeeklyLeaderboardParser.as::get year()
    get year(): number
    {
        return this._year;
    }

    // AS3: Game2WeeklyLeaderboardParser.as::get week()
    get week(): number
    {
        return this._week;
    }

    // AS3: Game2WeeklyLeaderboardParser.as::get maxOffset()
    get maxOffset(): number
    {
        return this._maxOffset;
    }

    // AS3: Game2WeeklyLeaderboardParser.as::get currentOffset()
    get currentOffset(): number
    {
        return this._currentOffset;
    }

    // AS3: Game2WeeklyLeaderboardParser.as::get minutesUntilReset()
    get minutesUntilReset(): number
    {
        return this._minutesUntilReset;
    }

    // AS3: Game2WeeklyLeaderboardParser.as::flush()
    override flush(): boolean
    {
        this._year = -1;
        this._week = -1;
        this._maxOffset = -1;
        this._currentOffset = -1;
        this._minutesUntilReset = -1;

        return super.flush();
    }

    // AS3: Game2WeeklyLeaderboardParser.as::parse()
    override parse(wrapper: IMessageDataWrapper): boolean
    {
        this._year = wrapper.readInt();
        this._week = wrapper.readInt();
        this._maxOffset = wrapper.readInt();
        this._currentOffset = wrapper.readInt();
        this._minutesUntilReset = wrapper.readInt();

        return super.parse(wrapper);
    }
}

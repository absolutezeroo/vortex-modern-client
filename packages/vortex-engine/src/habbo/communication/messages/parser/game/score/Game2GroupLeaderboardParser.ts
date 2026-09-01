import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import {Game2LeaderboardEntryData} from './Game2LeaderboardEntryData';

/**
 * One page of an all-time *group* leaderboard: the same rows plus the viewer's favourite group id,
 * which is how the table knows which row to centre on.
 *
 * Note this does **not** extend `Game2LeaderboardParser` in AS3 — it repeats the three fields — so
 * it does not extend it here either. The weekly variants do extend.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_4040/Game2GroupLeaderboardParser.as
 */
export class Game2GroupLeaderboardParser implements IMessageParser
{
    // AS3: Game2GroupLeaderboardParser.as::_SafeStr_7618
    private _gameTypeId: number = -1;

    // AS3: Game2GroupLeaderboardParser.as::_SafeStr_7279
    private _leaderboard: Game2LeaderboardEntryData[] = [];

    // AS3: Game2GroupLeaderboardParser.as::_SafeStr_6380
    private _totalListSize: number = -1;

    // AS3: Game2GroupLeaderboardParser.as::_SafeStr_7524
    private _favouriteGroupId: number = -1;

    // AS3: Game2GroupLeaderboardParser.as::get gameTypeId()
    get gameTypeId(): number
    {
        return this._gameTypeId;
    }

    // AS3: Game2GroupLeaderboardParser.as::get leaderboard()
    get leaderboard(): Game2LeaderboardEntryData[]
    {
        return this._leaderboard;
    }

    // AS3: Game2GroupLeaderboardParser.as::get totalListSize()
    get totalListSize(): number
    {
        return this._totalListSize;
    }

    // AS3: Game2GroupLeaderboardParser.as::get favouriteGroupId()
    get favouriteGroupId(): number
    {
        return this._favouriteGroupId;
    }

    // AS3: Game2GroupLeaderboardParser.as::flush()
    flush(): boolean
    {
        this._gameTypeId = -1;
        this._leaderboard = [];
        this._totalListSize = -1;
        this._favouriteGroupId = -1;

        return true;
    }

    // AS3: Game2GroupLeaderboardParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._leaderboard = [];

        const count = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            this._leaderboard.push(new Game2LeaderboardEntryData(wrapper));
        }

        this._totalListSize = wrapper.readInt();
        this._gameTypeId = wrapper.readInt();
        this._favouriteGroupId = wrapper.readInt();

        return true;
    }
}

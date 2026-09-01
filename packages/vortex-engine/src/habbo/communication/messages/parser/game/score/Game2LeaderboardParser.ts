import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import {Game2LeaderboardEntryData} from './Game2LeaderboardEntryData';

/**
 * One page of an all-time leaderboard, user rows.
 *
 * `totalListSize` is what `LeaderboardTable` compares the last row's rank against to decide whether
 * there is another page below.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_4040/Game2LeaderboardParser.as
 */
export class Game2LeaderboardParser implements IMessageParser
{
    // AS3: Game2LeaderboardParser.as::_SafeStr_7618
    protected _gameTypeId: number = -1;

    // AS3: Game2LeaderboardParser.as::_SafeStr_7279
    protected _leaderboard: Game2LeaderboardEntryData[] = [];

    // AS3: Game2LeaderboardParser.as::_SafeStr_6380
    protected _totalListSize: number = -1;

    // AS3: Game2LeaderboardParser.as::get gameTypeId()
    get gameTypeId(): number
    {
        return this._gameTypeId;
    }

    // AS3: Game2LeaderboardParser.as::get leaderboard()
    get leaderboard(): Game2LeaderboardEntryData[]
    {
        return this._leaderboard;
    }

    // AS3: Game2LeaderboardParser.as::get totalListSize()
    get totalListSize(): number
    {
        return this._totalListSize;
    }

    // AS3: Game2LeaderboardParser.as::flush()
    flush(): boolean
    {
        this._gameTypeId = -1;
        this._leaderboard = [];
        this._totalListSize = -1;

        return true;
    }

    // AS3: Game2LeaderboardParser.as::parse()
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

        return true;
    }
}

import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import {Game2GameResult} from '../data/Game2GameResult';
import {Game2SnowWarGameStats} from '../data/Game2SnowWarGameStats';
import {Game2TeamScoreData} from '../data/Game2TeamScoreData';

/**
 * Everything the ending panel is built from: the result, one score block per team, and the
 * player-level statistics.
 *
 * Two AS3 oddities transcribed rather than tidied. `teamScores` is declared, cleared by `flush()`
 * and never written — `parse()` pushes every `Game2TeamScoreData` into `teams`, so the getter
 * always answers an empty array; `GameEndingViewController` reads `teams`. And `flush()` returns
 * false where the fields it just reset suggest true; nothing downstream reads that return, so the
 * value is kept as written.
 *
 * Name recovered from `win63_version`'s readable filename; `_SafeCls_4444` in the primary tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2265/_SafeCls_4444.as
 * @see sources/win63_version/habbo/communication/messages/parser/game/snowwar/arena/Game2GameEndingMessageEventParser.as
 */
export class Game2GameEndingMessageEventParser implements IMessageParser
{
    // AS3: _SafeCls_4444.as::_SafeStr_7773
    private _timeToNextState: number = -1;

    // AS3: _SafeCls_4444.as::_teams
    private _teams: Game2TeamScoreData[] = [];

    // AS3: _SafeCls_4444.as::_teamScores
    private _teamScores: Game2TeamScoreData[] = [];

    // AS3: _SafeCls_4444.as::_SafeStr_8848
    private _generalStats: Game2SnowWarGameStats | null = null;

    // AS3: _SafeCls_4444.as::_SafeStr_6782
    private _gameResult: Game2GameResult | null = null;

    // AS3: _SafeCls_4444.as::get timeToNextState()
    get timeToNextState(): number
    {
        return this._timeToNextState;
    }

    // AS3: _SafeCls_4444.as::get teams()
    get teams(): Game2TeamScoreData[]
    {
        return this._teams;
    }

    // AS3: _SafeCls_4444.as::get teamScores()
    get teamScores(): Game2TeamScoreData[]
    {
        return this._teamScores;
    }

    // AS3: _SafeCls_4444.as::get gameResult()
    get gameResult(): Game2GameResult | null
    {
        return this._gameResult;
    }

    // AS3: _SafeCls_4444.as::get generalStats()
    get generalStats(): Game2SnowWarGameStats | null
    {
        return this._generalStats;
    }

    // AS3: _SafeCls_4444.as::flush()
    flush(): boolean
    {
        this._timeToNextState = -1;
        this._teams = [];
        this._teamScores = [];

        return false;
    }

    // AS3: _SafeCls_4444.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._timeToNextState = wrapper.readInt();
        this._gameResult = new Game2GameResult(wrapper);

        const count = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            this._teams.push(new Game2TeamScoreData(wrapper));
        }

        this._generalStats = new Game2SnowWarGameStats(wrapper);

        return true;
    }
}

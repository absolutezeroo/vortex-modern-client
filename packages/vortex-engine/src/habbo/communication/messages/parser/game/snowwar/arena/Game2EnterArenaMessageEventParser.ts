import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import {Game2PlayerData} from '../data/Game2PlayerData';
import {GameLevelData} from '../data/GameLevelData';

/**
 * The arena itself: which game, which field, how many teams, who is in it, and the level geometry
 * the tile grid is built from. This is the message that makes `SnowWarEngine.initArena()` happen.
 *
 * Name recovered from `win63_version`'s readable filename; `_SafeCls_4289` in the primary tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2265/_SafeCls_4289.as
 * @see sources/win63_version/habbo/communication/messages/parser/game/snowwar/arena/Game2EnterArenaMessageEventParser.as
 */
export class Game2EnterArenaMessageEventParser implements IMessageParser
{
    // AS3: _SafeCls_4289.as::_SafeStr_6884
    private _gameType: number = -1;

    // AS3: _SafeCls_4289.as::_SafeStr_7522
    private _fieldType: number = -1;

    // AS3: _SafeCls_4289.as::_numberOfTeams
    private _numberOfTeams: number = -1;

    // AS3: _SafeCls_4289.as::_players
    private _players: Game2PlayerData[] = [];

    // AS3: _SafeCls_4289.as::_SafeStr_7809
    private _gameLevel: GameLevelData | null = null;

    // AS3: _SafeCls_4289.as::get gameType()
    get gameType(): number
    {
        return this._gameType;
    }

    // AS3: _SafeCls_4289.as::get fieldType()
    get fieldType(): number
    {
        return this._fieldType;
    }

    // AS3: _SafeCls_4289.as::get numberOfTeams()
    get numberOfTeams(): number
    {
        return this._numberOfTeams;
    }

    // AS3: _SafeCls_4289.as::get players()
    get players(): Game2PlayerData[]
    {
        return this._players;
    }

    // AS3: _SafeCls_4289.as::get gameLevel()
    get gameLevel(): GameLevelData | null
    {
        return this._gameLevel;
    }

    // AS3: _SafeCls_4289.as::flush()
    flush(): boolean
    {
        this._gameType = -1;
        this._fieldType = -1;
        this._numberOfTeams = -1;

        for(const player of this._players)
        {
            player.dispose();
        }

        this._players = [];

        return true;
    }

    // AS3: _SafeCls_4289.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._gameType = wrapper.readInt();
        this._fieldType = wrapper.readInt();
        this._numberOfTeams = wrapper.readInt();

        const count = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            const player = new Game2PlayerData();

            player.parse(wrapper);
            this._players.push(player);
        }

        this._gameLevel = new GameLevelData(wrapper);

        return true;
    }
}

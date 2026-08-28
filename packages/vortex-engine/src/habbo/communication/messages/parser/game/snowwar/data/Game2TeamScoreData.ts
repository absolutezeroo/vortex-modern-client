import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {Game2TeamPlayerData} from './Game2TeamPlayerData';

/**
 * One team's line on the scoreboard, and the players under it.
 *
 * The team reference is read first and then handed down to every player, which is why
 * `Game2TeamPlayerData` takes it as an argument rather than reading it — it appears once on the
 * wire, not once per player.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/parser/game/snowwar/data/Game2TeamScoreData.as
 */
export class Game2TeamScoreData
{
    /** Derived name — `_SafeStr_5404`. */
    // AS3: Game2TeamScoreData.as::_SafeStr_5404
    private _score: number;

    /** Derived name — `_SafeStr_8463`. */
    // AS3: Game2TeamScoreData.as::_SafeStr_8463
    private _teamReference: number;

    // AS3: Game2TeamScoreData.as::_players
    private _players: Game2TeamPlayerData[];

    // AS3: Game2TeamScoreData.as::Game2TeamScoreData()
    constructor(wrapper: IMessageDataWrapper)
    {
        this._teamReference = wrapper.readInt();
        this._score = wrapper.readInt();
        this._players = [];

        const count = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            this._players.push(new Game2TeamPlayerData(this._teamReference, wrapper));
        }
    }

    // AS3: Game2TeamScoreData.as::get score()
    public get score(): number
    {
        return this._score;
    }

    // AS3: Game2TeamScoreData.as::get teamReference()
    public get teamReference(): number
    {
        return this._teamReference;
    }

    // AS3: Game2TeamScoreData.as::get players()
    public get players(): Game2TeamPlayerData[]
    {
        return this._players;
    }
}

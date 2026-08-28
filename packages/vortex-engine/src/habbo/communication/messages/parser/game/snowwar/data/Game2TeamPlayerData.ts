import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {Game2PlayerStatsData} from './Game2PlayerStatsData';

/**
 * A player as they appear on a team's scoreboard.
 *
 * `teamId` does **not** come off the wire — it is passed in by `Game2TeamScoreData`, which knows
 * which team it is reading. And `willRejoin` is the one mutable field on any of these DTOs: the
 * end-of-game view sets it when the player opts into the next round.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/parser/game/snowwar/data/Game2TeamPlayerData.as
 */
export class Game2TeamPlayerData
{
    /** Derived name — `_SafeStr_5971`. */
    // AS3: Game2TeamPlayerData.as::_SafeStr_5971
    private _userId: number;

    // AS3: Game2TeamPlayerData.as::_userName
    private _userName: string;

    /** Derived name — `_SafeStr_5404`. */
    // AS3: Game2TeamPlayerData.as::_SafeStr_5404
    private _score: number;

    /** Derived name — `_SafeStr_5551`. */
    // AS3: Game2TeamPlayerData.as::_SafeStr_5551
    private _figure: string;

    /** Derived name — `_SafeStr_4645`. */
    // AS3: Game2TeamPlayerData.as::_SafeStr_4645
    private _gender: string;

    /** Derived name — `_SafeStr_9171`. */
    // AS3: Game2TeamPlayerData.as::_SafeStr_9171
    private _playerStats: Game2PlayerStatsData;

    /** Derived name — `_SafeStr_9381`. */
    // AS3: Game2TeamPlayerData.as::_SafeStr_9381
    private _teamId: number;

    /** Derived name — `_SafeStr_7719`. */
    // AS3: Game2TeamPlayerData.as::_SafeStr_7719
    private _willRejoin: boolean;

    /** Note the wire order: name, id, figure, gender, score — not id first. */
    // AS3: Game2TeamPlayerData.as::Game2TeamPlayerData()
    constructor(teamId: number, wrapper: IMessageDataWrapper)
    {
        this._teamId = teamId;
        this._userName = wrapper.readString();
        this._userId = wrapper.readInt();
        this._figure = wrapper.readString();
        this._gender = wrapper.readString();
        this._score = wrapper.readInt();
        this._playerStats = new Game2PlayerStatsData(wrapper);
        this._willRejoin = false;
    }

    // AS3: Game2TeamPlayerData.as::get userId()
    public get userId(): number
    {
        return this._userId;
    }

    // AS3: Game2TeamPlayerData.as::get score()
    public get score(): number
    {
        return this._score;
    }

    // AS3: Game2TeamPlayerData.as::get userName()
    public get userName(): string
    {
        return this._userName;
    }

    // AS3: Game2TeamPlayerData.as::get figure()
    public get figure(): string
    {
        return this._figure;
    }

    // AS3: Game2TeamPlayerData.as::get gender()
    public get gender(): string
    {
        return this._gender;
    }

    // AS3: Game2TeamPlayerData.as::get playerStats()
    public get playerStats(): Game2PlayerStatsData
    {
        return this._playerStats;
    }

    // AS3: Game2TeamPlayerData.as::get teamId()
    public get teamId(): number
    {
        return this._teamId;
    }

    // AS3: Game2TeamPlayerData.as::get willRejoin()
    public get willRejoin(): boolean
    {
        return this._willRejoin;
    }

    // AS3: Game2TeamPlayerData.as::set willRejoin()
    public set willRejoin(value: boolean)
    {
        this._willRejoin = value;
    }
}

import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * One player's scoreboard line: ten counters, read in a fixed order and never written again.
 *
 * All ten names are DERIVED — every field is obfuscated in every tree, and they are named from the
 * order the leaderboard views read them back in. The wire order is what matters and it is exact.
 *
 * `friendlyHits`/`friendlyKills` are the own-team ones and are counted separately from `kills`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/parser/game/snowwar/data/Game2PlayerStatsData.as
 */
export class Game2PlayerStatsData
{
    /** Derived name — `_SafeStr_5404`. */
    // AS3: Game2PlayerStatsData.as::_SafeStr_5404
    private _score: number;

    /** Derived name — `_SafeStr_9728`. */
    // AS3: Game2PlayerStatsData.as::_SafeStr_9728
    private _kills: number;

    /** Derived name — `_SafeStr_8882`. */
    // AS3: Game2PlayerStatsData.as::_SafeStr_8882
    private _deaths: number;

    /** Derived name — `_SafeStr_9529`. */
    // AS3: Game2PlayerStatsData.as::_SafeStr_9529
    private _snowballHits: number;

    /** Derived name — `_SafeStr_10017`. */
    // AS3: Game2PlayerStatsData.as::_SafeStr_10017
    private _snowballHitsTaken: number;

    /** Derived name — `_SafeStr_9939`. */
    // AS3: Game2PlayerStatsData.as::_SafeStr_9939
    private _snowballsThrown: number;

    /** Derived name — `_SafeStr_9764`. */
    // AS3: Game2PlayerStatsData.as::_SafeStr_9764
    private _snowballsCreated: number;

    /** Derived name — `_SafeStr_8818`. */
    // AS3: Game2PlayerStatsData.as::_SafeStr_8818
    private _snowballsFromMachine: number;

    /** Derived name — `_SafeStr_8860`. */
    // AS3: Game2PlayerStatsData.as::_SafeStr_8860
    private _friendlyHits: number;

    /** Derived name — `_SafeStr_9253`. */
    // AS3: Game2PlayerStatsData.as::_SafeStr_9253
    private _friendlyKills: number;

    // AS3: Game2PlayerStatsData.as::Game2PlayerStatsData()
    constructor(wrapper: IMessageDataWrapper)
    {
        this._score = wrapper.readInt();
        this._kills = wrapper.readInt();
        this._deaths = wrapper.readInt();
        this._snowballHits = wrapper.readInt();
        this._snowballHitsTaken = wrapper.readInt();
        this._snowballsThrown = wrapper.readInt();
        this._snowballsCreated = wrapper.readInt();
        this._snowballsFromMachine = wrapper.readInt();
        this._friendlyHits = wrapper.readInt();
        this._friendlyKills = wrapper.readInt();
    }

    // AS3: Game2PlayerStatsData.as::get score()
    public get score(): number
    {
        return this._score;
    }

    // AS3: Game2PlayerStatsData.as::get kills()
    public get kills(): number
    {
        return this._kills;
    }

    // AS3: Game2PlayerStatsData.as::get deaths()
    public get deaths(): number
    {
        return this._deaths;
    }

    // AS3: Game2PlayerStatsData.as::get snowballHits()
    public get snowballHits(): number
    {
        return this._snowballHits;
    }

    // AS3: Game2PlayerStatsData.as::get snowballHitsTaken()
    public get snowballHitsTaken(): number
    {
        return this._snowballHitsTaken;
    }

    // AS3: Game2PlayerStatsData.as::get snowballsThrown()
    public get snowballsThrown(): number
    {
        return this._snowballsThrown;
    }

    // AS3: Game2PlayerStatsData.as::get snowballsCreated()
    public get snowballsCreated(): number
    {
        return this._snowballsCreated;
    }

    // AS3: Game2PlayerStatsData.as::get snowballsFromMachine()
    public get snowballsFromMachine(): number
    {
        return this._snowballsFromMachine;
    }

    // AS3: Game2PlayerStatsData.as::get friendlyHits()
    public get friendlyHits(): number
    {
        return this._friendlyHits;
    }

    // AS3: Game2PlayerStatsData.as::get friendlyKills()
    public get friendlyKills(): number
    {
        return this._friendlyKills;
    }
}

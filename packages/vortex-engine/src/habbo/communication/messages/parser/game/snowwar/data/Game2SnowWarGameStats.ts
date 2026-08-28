import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * The two per-game superlatives, as player ids.
 *
 * Both names are DERIVED; the getters are the only readable thing about either field.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/parser/game/snowwar/data/Game2SnowWarGameStats.as
 */
export class Game2SnowWarGameStats
{
    /** Derived name — `_SafeStr_9425`. */
    // AS3: Game2SnowWarGameStats.as::_SafeStr_9425
    private _playerWithMostKills: number;

    /** Derived name — `_SafeStr_9114`. */
    // AS3: Game2SnowWarGameStats.as::_SafeStr_9114
    private _playerWithMostHits: number;

    // AS3: Game2SnowWarGameStats.as::Game2SnowWarGameStats()
    constructor(wrapper: IMessageDataWrapper)
    {
        this._playerWithMostKills = wrapper.readInt();
        this._playerWithMostHits = wrapper.readInt();
    }

    // AS3: Game2SnowWarGameStats.as::get playerWithMostKills()
    public get playerWithMostKills(): number
    {
        return this._playerWithMostKills;
    }

    // AS3: Game2SnowWarGameStats.as::get playerWithMostHits()
    public get playerWithMostHits(): number
    {
        return this._playerWithMostHits;
    }
}

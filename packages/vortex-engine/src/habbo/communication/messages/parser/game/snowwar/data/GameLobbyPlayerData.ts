import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * A player sitting in a game lobby, before the arena exists.
 *
 * The two comparators are AS3 `Function` fields assigned from private statics, and both sort
 * **descending** — they return 1 when the left side is smaller. That is deliberate: the lobby
 * lists the best player first.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/parser/game/snowwar/data/GameLobbyPlayerData.as
 */
export class GameLobbyPlayerData
{
    /** Derived name — `_SafeStr_5971`. */
    // AS3: GameLobbyPlayerData.as::_SafeStr_5971
    private _userId: number;

    // AS3: GameLobbyPlayerData.as::_name
    private _name: string;

    /** Derived name — `_SafeStr_5551`. */
    // AS3: GameLobbyPlayerData.as::_SafeStr_5551
    private _figure: string;

    /** Derived name — `_SafeStr_4645`. */
    // AS3: GameLobbyPlayerData.as::_SafeStr_4645
    private _gender: string;

    /** Derived name — `_SafeStr_9381`. */
    // AS3: GameLobbyPlayerData.as::_SafeStr_9381
    private _teamId: number;

    /** Derived name — `_SafeStr_9238`. */
    // AS3: GameLobbyPlayerData.as::_SafeStr_9238
    private _skillLevel: number;

    /** Derived name — `_SafeStr_9356`. */
    // AS3: GameLobbyPlayerData.as::_SafeStr_9356
    private _totalScore: number;

    /** Derived name — `_SafeStr_8962`. */
    // AS3: GameLobbyPlayerData.as::_SafeStr_8962
    private _scoreToNextLevel: number;

    // AS3: GameLobbyPlayerData.as::GameLobbyPlayerData()
    constructor(wrapper: IMessageDataWrapper)
    {
        this._userId = wrapper.readInt();
        this._name = wrapper.readString();
        this._figure = wrapper.readString();
        this._gender = wrapper.readString();
        this._teamId = wrapper.readInt();
        this._skillLevel = wrapper.readInt();
        this._totalScore = wrapper.readInt();
        this._scoreToNextLevel = wrapper.readInt();
    }

    // AS3: GameLobbyPlayerData.as::get userId()
    public get userId(): number
    {
        return this._userId;
    }

    // AS3: GameLobbyPlayerData.as::get name()
    public get name(): string
    {
        return this._name;
    }

    // AS3: GameLobbyPlayerData.as::get figure()
    public get figure(): string
    {
        return this._figure;
    }

    // AS3: GameLobbyPlayerData.as::get gender()
    public get gender(): string
    {
        return this._gender;
    }

    // AS3: GameLobbyPlayerData.as::get teamId()
    public get teamId(): number
    {
        return this._teamId;
    }

    // AS3: GameLobbyPlayerData.as::get skillLevel()
    public get skillLevel(): number
    {
        return this._skillLevel;
    }

    // AS3: GameLobbyPlayerData.as::get totalScore()
    public get totalScore(): number
    {
        return this._totalScore;
    }

    // AS3: GameLobbyPlayerData.as::get scoreToNextLevel()
    public get scoreToNextLevel(): number
    {
        return this._scoreToNextLevel;
    }

    /** Derived name — `_SafeStr_10195`: the descending-by-score comparator. */
    // AS3: GameLobbyPlayerData.as::_SafeStr_10195
    public static readonly COMPARE_BY_TOTAL_SCORE = GameLobbyPlayerData.comparePlayersByTotalScore;

    /** Derived name — `_SafeStr_8784`: the descending-by-skill comparator. */
    // AS3: GameLobbyPlayerData.as::_SafeStr_8784
    public static readonly COMPARE_BY_SKILL_LEVEL = GameLobbyPlayerData.comparePlayersBySkillLevel;

    /** Descending: 1 when `a` scores less, so the highest sorts first. */
    // AS3: GameLobbyPlayerData.as::comparePlayersByTotalScore()
    private static comparePlayersByTotalScore(a: GameLobbyPlayerData, b: GameLobbyPlayerData): number
    {
        if(a.totalScore < b.totalScore) return 1;
        if(a.totalScore === b.totalScore) return 0;

        return -1;
    }

    // AS3: GameLobbyPlayerData.as::comparePlayersBySkillLevel()
    private static comparePlayersBySkillLevel(a: GameLobbyPlayerData, b: GameLobbyPlayerData): number
    {
        if(a.skillLevel < b.skillLevel) return 1;
        if(a.skillLevel === b.skillLevel) return 0;

        return -1;
    }
}

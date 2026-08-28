import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * How a game ended: the mode it was, the way it finished, and who took it.
 *
 * The three result constants are DERIVED — obfuscated in every tree — and nothing in the AS3
 * tree reads them back, so their meaning comes from their values and their order alone. They are
 * kept because `resultType` is otherwise a bare integer with no vocabulary at all.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/parser/game/snowwar/data/Game2GameResult.as
 */
export class Game2GameResult
{
    /** Derived name — `_SafeStr_10525`; no reader in any tree, so the name is its value. */
    // AS3: Game2GameResult.as::_SafeStr_10525
    public static readonly RESULT_TYPE_0: number = 0;

    /** Derived name — `_SafeStr_11172`; no reader in any tree, so the name is its value. */
    // AS3: Game2GameResult.as::_SafeStr_11172
    public static readonly RESULT_TYPE_1: number = 1;

    /** Derived name — `_SafeStr_10602`; no reader in any tree, so the name is its value. */
    // AS3: Game2GameResult.as::_SafeStr_10602
    public static readonly RESULT_TYPE_2: number = 2;

    /** Derived name — `_SafeStr_9091`. */
    // AS3: Game2GameResult.as::_SafeStr_9091
    private _isDeathMatch: boolean;

    /** Derived name — `_SafeStr_7672`. */
    // AS3: Game2GameResult.as::_SafeStr_7672
    private _resultType: number;

    /** Derived name — `_SafeStr_9315`. */
    // AS3: Game2GameResult.as::_SafeStr_9315
    private _winnerId: number;

    // AS3: Game2GameResult.as::Game2GameResult()
    constructor(wrapper: IMessageDataWrapper)
    {
        this._isDeathMatch = wrapper.readBoolean();
        this._resultType = wrapper.readInt();
        this._winnerId = wrapper.readInt();
    }

    // AS3: Game2GameResult.as::get isDeathMatch()
    public get isDeathMatch(): boolean
    {
        return this._isDeathMatch;
    }

    // AS3: Game2GameResult.as::get resultType()
    public get resultType(): number
    {
        return this._resultType;
    }

    // AS3: Game2GameResult.as::get winnerId()
    public get winnerId(): number
    {
        return this._winnerId;
    }
}

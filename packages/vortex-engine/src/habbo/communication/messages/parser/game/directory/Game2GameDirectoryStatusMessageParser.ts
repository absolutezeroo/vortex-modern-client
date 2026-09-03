import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * Whether the game directory is open, and what this account's standing with it is.
 *
 * `blockLength` is a temporary ban from starting games; -1 in `freeGamesLeft` is the unlimited flag,
 * the same convention as `Game2AccountGameStatusMessageParser`.
 *
 * All four of AS3's status constants are declared. Only 0 has a recoverable meaning —
 * `_SafeCls_1951.onGameDirectoryStatus()` treats it as "open" and everything else as unavailable —
 * and the other three are obfuscated in *all three* trees (`_SafeStr_11239`/`_SafeStr_11102`/
 * `_SafeStr_11663` here, `const_950`/`const_850`/`const_518` in win63_version, PRODUCTION
 * obfuscates the file whole). They keep placeholder names that say so rather than invented ones:
 * the value is the wire contract, and a caller switching on it is unaffected by the name.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_4164/Game2GameDirectoryStatusMessageParser.as
 */
export class Game2GameDirectoryStatusMessageParser implements IMessageParser
{
    /**
     * Derived name — `_SafeStr_11578`. It is the 0 the handler tests for before opening the games
     * window; every other value takes the "directory not available" branch.
     */
    // AS3: Game2GameDirectoryStatusMessageParser.as::_SafeStr_11578
    public static readonly STATUS_AVAILABLE: number = 0;

    // AS3: Game2GameDirectoryStatusMessageParser.as::_SafeStr_11239 — obfuscated in every tree
    //   (`const_950` in win63_version); no call site distinguishes it.
    public static readonly STATUS_UNNAMED_1: number = 1;

    // AS3: Game2GameDirectoryStatusMessageParser.as::_SafeStr_11102 — obfuscated (`const_850`).
    public static readonly STATUS_UNNAMED_2: number = 2;

    // AS3: Game2GameDirectoryStatusMessageParser.as::_SafeStr_11663 — obfuscated (`const_518`).
    public static readonly STATUS_UNNAMED_3: number = 3;

    // AS3: Game2GameDirectoryStatusMessageParser.as::_status
    private _status: number = -1;

    // AS3: Game2GameDirectoryStatusMessageParser.as::_SafeStr_9910
    private _blockLength: number = 0;

    // AS3: Game2GameDirectoryStatusMessageParser.as::_SafeStr_9061
    private _gamesPlayed: number = 0;

    // AS3: Game2GameDirectoryStatusMessageParser.as::_SafeStr_8462
    private _freeGamesLeft: number = 0;

    // AS3: Game2GameDirectoryStatusMessageParser.as::get status()
    get status(): number
    {
        return this._status;
    }

    // AS3: Game2GameDirectoryStatusMessageParser.as::get blockLength()
    get blockLength(): number
    {
        return this._blockLength;
    }

    // AS3: Game2GameDirectoryStatusMessageParser.as::get gamesPlayed()
    get gamesPlayed(): number
    {
        return this._gamesPlayed;
    }

    // AS3: Game2GameDirectoryStatusMessageParser.as::get freeGamesLeft()
    get freeGamesLeft(): number
    {
        return this._freeGamesLeft;
    }

    // AS3: Game2GameDirectoryStatusMessageParser.as::get hasUnlimitedGames()
    get hasUnlimitedGames(): boolean
    {
        return this._freeGamesLeft === -1;
    }

    // AS3: Game2GameDirectoryStatusMessageParser.as::flush()
    flush(): boolean
    {
        return false;
    }

    // AS3: Game2GameDirectoryStatusMessageParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._status = wrapper.readInt();
        this._blockLength = wrapper.readInt();
        this._gamesPlayed = wrapper.readInt();
        this._freeGamesLeft = wrapper.readInt();

        return true;
    }
}

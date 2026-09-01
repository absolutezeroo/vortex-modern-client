import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * Whether the game directory is open, and what this account's standing with it is.
 *
 * `blockLength` is a temporary ban from starting games; -1 in `freeGamesLeft` is the unlimited flag,
 * the same convention as `Game2AccountGameStatusMessageParser`.
 *
 * TODO(AS3): sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_4164/Game2GameDirectoryStatusMessageParser.as
 * declares four public status constants (0..3) whose identifiers are obfuscated in *all three*
 * trees — `_SafeStr_11578`/`_SafeStr_11239`/`_SafeStr_11102`/`_SafeStr_11663` here, `const_661`/
 * `const_950`/`const_850`/`const_518` in win63_version, and PRODUCTION obfuscates this file whole.
 * Only 0 has a recoverable meaning (`_SafeCls_1951.onGameDirectoryStatus()` treats it as "open" and
 * everything else as unavailable), so only that one is declared below. Naming the other three would
 * be invention, not recovery.
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

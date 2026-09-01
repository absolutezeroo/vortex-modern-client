import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * How many games of one type this account has left.
 *
 * `freeGamesLeft` of -1 is not "none": it is the unlimited flag, which is why `hasUnlimitedGames`
 * is a derived getter over the same field rather than a byte of its own.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_4164/Game2AccountGameStatusMessageParser.as
 */
export class Game2AccountGameStatusMessageParser implements IMessageParser
{
    // AS3: Game2AccountGameStatusMessageParser.as::_SafeStr_7618
    private _gameTypeId: number = -1;

    // AS3: Game2AccountGameStatusMessageParser.as::_SafeStr_8462
    private _freeGamesLeft: number = 0;

    // AS3: Game2AccountGameStatusMessageParser.as::_SafeStr_9890
    private _gamesPlayedTotal: number = 0;

    // AS3: Game2AccountGameStatusMessageParser.as::get gameTypeId()
    get gameTypeId(): number
    {
        return this._gameTypeId;
    }

    // AS3: Game2AccountGameStatusMessageParser.as::get freeGamesLeft()
    get freeGamesLeft(): number
    {
        return this._freeGamesLeft;
    }

    // AS3: Game2AccountGameStatusMessageParser.as::get gamesPlayedTotal()
    get gamesPlayedTotal(): number
    {
        return this._gamesPlayedTotal;
    }

    // AS3: Game2AccountGameStatusMessageParser.as::get hasUnlimitedGames()
    get hasUnlimitedGames(): boolean
    {
        return this._freeGamesLeft === -1;
    }

    // AS3: Game2AccountGameStatusMessageParser.as::flush()
    flush(): boolean
    {
        return true;
    }

    // AS3: Game2AccountGameStatusMessageParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._gameTypeId = wrapper.readInt();
        this._freeGamesLeft = wrapper.readInt();
        this._gamesPlayedTotal = wrapper.readInt();

        return true;
    }
}

import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * The outcome of a limited-edition raffle the player entered (header 3526).
 *
 * A string and a *byte*, not two ints — and `hasWon` is `resultCode === 0`, so zero is the win.
 * That inversion is the one thing worth knowing about this message.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1714/_SafeCls_2319.as
 * (obfuscated; `className`, `resultCode` and `hasWon` keep their real names, and
 * `HabboCatalog.as::onLtdRaffleResult()` is its only reader.)
 */
export class LtdRaffleResultMessageParser implements IMessageParser
{
    // AS3: .../_SafeCls_2319.as::_className
    private _className: string = '';

    // AS3: .../_SafeCls_2319.as::_SafeStr_6204 (name from `get resultCode()`)
    private _resultCode: number = 0;

    // AS3: .../_SafeCls_2319.as::get className()
    get className(): string
    {
        return this._className;
    }

    // AS3: .../_SafeCls_2319.as::get resultCode()
    get resultCode(): number
    {
        return this._resultCode;
    }

    // AS3: .../_SafeCls_2319.as::get hasWon()
    get hasWon(): boolean
    {
        return this._resultCode === 0;
    }

    // AS3: .../_SafeCls_2319.as::flush()
    flush(): boolean
    {
        this._className = '';
        this._resultCode = 0;

        return true;
    }

    // AS3: .../_SafeCls_2319.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._className = wrapper.readString();
        this._resultCode = wrapper.readByte();

        return true;
    }
}

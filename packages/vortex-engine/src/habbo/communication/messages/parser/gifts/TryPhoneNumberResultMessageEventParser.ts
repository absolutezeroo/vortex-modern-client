import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parses the answer to a submitted phone number.
 *
 * `resultCode` is a {@link PhoneNumberStatusEnum} value; `millisToAllowProcessReset` is how long
 * the "I did not get the code" link stays disabled, and the verify view counts it down.
 *
 * The accessor really is `millisToAllowProcessReset` here — the *other* two phone parsers spell
 * the same idea `millisecondsToAllowProcessReset`. Both names are AS3's.
 *
 * Name recovered from `sources/win63_version/habbo/communication/messages/parser/gifts/TryPhoneNumberResultMessageEventParser.as`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_4148/_SafeCls_4147.as
 */
export class TryPhoneNumberResultMessageEventParser implements IMessageParser
{
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_4148/_SafeCls_4147.as::_SafeStr_6204
    private _resultCode: number = -1;

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_4148/_SafeCls_4147.as::_SafeStr_9628
    private _millisToAllowProcessReset: number = 0;

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_4148/_SafeCls_4147.as::get resultCode()
    get resultCode(): number
    {
        return this._resultCode;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_4148/_SafeCls_4147.as::get millisToAllowProcessReset()
    get millisToAllowProcessReset(): number
    {
        return this._millisToAllowProcessReset;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_4148/_SafeCls_4147.as::flush()
    flush(): boolean
    {
        this._resultCode = -1;

        return true;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_4148/_SafeCls_4147.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._resultCode = wrapper.readInt();
        this._millisToAllowProcessReset = wrapper.readInt();

        return true;
    }
}

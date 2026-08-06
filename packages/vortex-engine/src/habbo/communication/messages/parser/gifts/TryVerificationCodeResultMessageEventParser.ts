import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parses the answer to a submitted verification code.
 *
 * `resultCode` is a {@link PhoneNumberStatusEnum} value: VERIFIED and OK close the verify view,
 * TOKEN_MISMATCH re-opens it and reports the failure.
 *
 * Name recovered from `sources/win63_version/habbo/communication/messages/parser/gifts/TryVerificationCodeResultMessageEventParser.as`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_4148/_SafeCls_4233.as
 */
export class TryVerificationCodeResultMessageEventParser implements IMessageParser
{
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_4148/_SafeCls_4233.as::_SafeStr_6204
    private _resultCode: number = -1;

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_4148/_SafeCls_4233.as::_SafeStr_7714
    private _millisecondsToAllowProcessReset: number = -1;

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_4148/_SafeCls_4233.as::get resultCode()
    get resultCode(): number
    {
        return this._resultCode;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_4148/_SafeCls_4233.as::get millisecondsToAllowProcessReset()
    get millisecondsToAllowProcessReset(): number
    {
        return this._millisecondsToAllowProcessReset;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_4148/_SafeCls_4233.as::flush()
    flush(): boolean
    {
        this._resultCode = -1;
        this._millisecondsToAllowProcessReset = -1;

        return true;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_4148/_SafeCls_4233.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._resultCode = wrapper.readInt();
        this._millisecondsToAllowProcessReset = wrapper.readInt();

        return true;
    }
}

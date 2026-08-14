import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * Whether the photo was entered into the competition, and why not if it was refused.
 *
 * AS3: sources/win63_version/habbo/communication/messages/parser/camera/CompetitionStatusMessageEventParser.as
 * (`_SafePkg_4018/_SafeCls_4033` in the primary tree; header 2622 from WIN63's registry)
 */
export class CompetitionStatusMessageParser implements IMessageParser
{
    // AS3: .../_SafePkg_4018/_SafeCls_4033.as::_SafeStr_7505
    private _ok: boolean = false;

    // AS3: .../_SafePkg_4018/_SafeCls_4033.as::_SafeStr_8225
    private _errorReason: string | null = null;

    // AS3: .../_SafePkg_4018/_SafeCls_4033.as::isOk()
    isOk(): boolean
    {
        return this._ok;
    }

    // AS3: .../_SafePkg_4018/_SafeCls_4033.as::getErrorReason()
    getErrorReason(): string | null
    {
        return this._errorReason;
    }

    // AS3: .../_SafePkg_4018/_SafeCls_4033.as::flush()
    flush(): boolean
    {
        this._ok = false;
        this._errorReason = null;

        return true;
    }

    // AS3: .../_SafePkg_4018/_SafeCls_4033.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        // Unconditional, unlike the sibling status parsers: the reason string is on the wire even
        // when `ok` is true.
        this._ok = wrapper.readBoolean();
        this._errorReason = wrapper.readString();

        return true;
    }
}

import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * How a sandbox self-donation ended. One integer.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3706/_SafeCls_3705.as
 * (the event that carries it kept its real name, `SelfDonationResultMessageEvent`; this parser did
 * not, and is named after it)
 */
export class SelfDonationResultMessageParser implements IMessageParser
{
    /**
	 * The three codes AS3 declares. **Names derived** — the identifiers are obfuscated in every
	 * tree, and these come from the message keys `SelfDonationTool.onSelfDonationResult()` picks per
	 * code: `result.success`, `result.not_allowed`, and `result.failed` for anything else.
	 *
	 * Note the tool switches on 0 and 1 and treats *everything else* as failure, so 2 is never
	 * distinguished from an unknown code at the call site.
	 */
    // AS3: _SafeCls_3705.as::_SafeStr_8683 (name derived)
    static readonly RESULT_SUCCESS: number = 0;

    // AS3: _SafeCls_3705.as::_SafeStr_10912 (name derived)
    static readonly RESULT_NOT_ALLOWED: number = 1;

    // AS3: _SafeCls_3705.as::_SafeStr_11571 (name derived)
    static readonly RESULT_FAILED: number = 2;

    // AS3: _SafeCls_3705.as::resultCode (backing field)
    private _resultCode: number = -1;

    // AS3: _SafeCls_3705.as::get resultCode()
    get resultCode(): number
    {
        return this._resultCode;
    }

    /**
	 * AS3 flushes to **-1**, not 0 — 0 is a real code meaning success, so a flushed parser must not
	 * read as one.
	 */
    // AS3: _SafeCls_3705.as::flush()
    flush(): boolean
    {
        this._resultCode = -1;

        return true;
    }

    // AS3: _SafeCls_3705.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._resultCode = wrapper.readInt();

        return true;
    }
}

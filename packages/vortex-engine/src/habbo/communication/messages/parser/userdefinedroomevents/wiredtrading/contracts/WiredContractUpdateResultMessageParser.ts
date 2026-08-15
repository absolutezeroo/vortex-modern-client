import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * Whether saving a contract was accepted, header 3720.
 *
 * `failCode` is a string and is present on success too — AS3 reads all three fields
 * unconditionally, so a successful save carries an empty code rather than omitting it.
 *
 * **Name DERIVED** — named for the AS3 handler it feeds,
 * `WiredContractController::onContractUpdateResult()`. No unobfuscated tree carries it and the
 * emulator has no constant for 3720.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2588/_SafeCls_3643.as
 */
export class WiredContractUpdateResultMessageParser implements IMessageParser
{
    // AS3: _SafeCls_3643.as::contractId (backing field)
    private _contractId: number = 0;

    // AS3: _SafeCls_3643.as::isSuccess (backing field)
    private _isSuccess: boolean = false;

    // AS3: _SafeCls_3643.as::failCode (backing field)
    private _failCode: string | null = null;

    // AS3: _SafeCls_3643.as::get contractId()
    get contractId(): number
    {
        return this._contractId;
    }

    // AS3: _SafeCls_3643.as::get isSuccess()
    get isSuccess(): boolean
    {
        return this._isSuccess;
    }

    // AS3: _SafeCls_3643.as::get failCode()
    get failCode(): string | null
    {
        return this._failCode;
    }

    // AS3: _SafeCls_3643.as::flush()
    flush(): boolean
    {
        this._contractId = 0;
        this._isSuccess = false;
        this._failCode = null;

        return true;
    }

    // AS3: _SafeCls_3643.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._contractId = wrapper.readInt();
        this._isSuccess = wrapper.readBoolean();
        this._failCode = wrapper.readString();

        return true;
    }
}

import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * A wired transaction was refused, header 352.
 *
 * One int, and it is a *type* rather than a message: the notification handler looks up
 * `wired_transactions.notification.fail.<transactionFailureTypeId>` and drops the result into
 * `wired_transactions.notification.fail`'s `reason` parameter.
 *
 * **Name DERIVED** — no unobfuscated tree carries this message and the emulator has no constant for
 * 352. Named after the handler that reads it (`_SafeCls_1951.as::onWiredTransactionFail()`) and its
 * one readable getter. It is the counterpart of {@link WiredTransactionSuccessMessageParser}, whose
 * AS3 class sits in the same obfuscated package.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2640/_SafeCls_3046.as
 */
export class WiredTransactionFailMessageParser implements IMessageParser
{
    // AS3: _SafeCls_3046.as::_SafeStr_8053 (backing field of transactionFailureTypeId)
    private _transactionFailureTypeId: number = 0;

    // AS3: _SafeCls_3046.as::get transactionFailureTypeId()
    get transactionFailureTypeId(): number
    {
        return this._transactionFailureTypeId;
    }

    // AS3: _SafeCls_3046.as::flush()
    flush(): boolean
    {
        this._transactionFailureTypeId = 0;

        return true;
    }

    // AS3: _SafeCls_3046.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._transactionFailureTypeId = wrapper.readInt();

        return true;
    }
}

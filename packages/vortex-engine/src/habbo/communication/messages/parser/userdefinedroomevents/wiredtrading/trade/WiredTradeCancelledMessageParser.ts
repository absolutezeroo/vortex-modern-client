import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * A wired trade was cancelled (header 1481), and why.
 *
 * Name DERIVED from `inventory/_SafeCls_1951.as::onWiredTradeCancelled()`. The single field's name
 * is AS3's own and readable.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/trade/_SafeCls_3010.as
 */
export class WiredTradeCancelledMessageParser implements IMessageParser
{
    // AS3: _SafeCls_3010.as::_SafeStr_8053 (from `get transactionFailureTypeId()`)
    private _transactionFailureTypeId: number = 0;

    // AS3: _SafeCls_3010.as::get transactionFailureTypeId()
    get transactionFailureTypeId(): number
    {
        return this._transactionFailureTypeId;
    }

    // AS3: _SafeCls_3010.as::flush()
    flush(): boolean
    {
        this._transactionFailureTypeId = 0;

        return true;
    }

    // AS3: _SafeCls_3010.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._transactionFailureTypeId = wrapper.readInt();

        return true;
    }
}

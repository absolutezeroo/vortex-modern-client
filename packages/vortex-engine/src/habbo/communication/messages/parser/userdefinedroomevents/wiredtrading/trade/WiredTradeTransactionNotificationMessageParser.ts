import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * A wired *trade* went wrong, header 655.
 *
 * Same shape as {@link WiredTransactionFailMessageParser} and a different domain: the handler reads
 * `wired_transactions.notification.trade_error.<tradeTransactionNotificationId>` and feeds it to
 * `wired_transactions.notification.trade_error`'s `error` parameter.
 *
 * **Name DERIVED** — no unobfuscated tree carries it and the emulator has no constant for 655
 * (`win63_version` has a `WiredFurniActionEvent` at that id, but that is an older revision and a
 * different message; its ids moved). The AS3 *package* here is real, not obfuscated, which is why
 * this file sits under `wiredtrading/trade/`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/trade/_SafeCls_3049.as
 */
export class WiredTradeTransactionNotificationMessageParser implements IMessageParser
{
    // AS3: _SafeCls_3049.as::_SafeStr_8140 (backing field of tradeTransactionNotificationId)
    private _tradeTransactionNotificationId: number = 0;

    // AS3: _SafeCls_3049.as::get tradeTransactionNotificationId()
    get tradeTransactionNotificationId(): number
    {
        return this._tradeTransactionNotificationId;
    }

    // AS3: _SafeCls_3049.as::flush()
    flush(): boolean
    {
        this._tradeTransactionNotificationId = 0;

        return true;
    }

    // AS3: _SafeCls_3049.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._tradeTransactionNotificationId = wrapper.readInt();

        return true;
    }
}

import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * A wired trade went through (header 2137). Payload-free: the arrival is the whole message, and
 * the model responds by closing the trade window.
 *
 * Name DERIVED from `inventory/_SafeCls_1951.as::onWiredTradeCompleted()`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/trade/_SafeCls_4083.as
 */
export class WiredTradeCompletedMessageParser implements IMessageParser
{
    // AS3: _SafeCls_4083.as::flush()
    flush(): boolean
    {
        return true;
    }

    // AS3: _SafeCls_4083.as::parse()
    parse(_wrapper: IMessageDataWrapper): boolean
    {
        return true;
    }
}

import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * The other side's account may not trade. Carries no payload — the message itself is the news.
 *
 * AS3: sources/win63_version/habbo/communication/messages/parser/inventory/trading/TradingOtherNotAllowedEventParser.as
 * (obfuscated as `_SafeCls_3845`'s parser in the primary tree)
 */
export class TradingOtherNotAllowedEventParser implements IMessageParser
{
    // AS3: .../TradingOtherNotAllowedEventParser.as::flush()
    flush(): boolean
    {
        return true;
    }

    // AS3: .../TradingOtherNotAllowedEventParser.as::parse()
    // AS3 reads nothing from the wrapper.
    parse(_wrapper: IMessageDataWrapper): boolean
    {
        return true;
    }
}

import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * Your own account may not trade. Carries no payload — the message itself is the news.
 *
 * AS3: sources/win63_version/habbo/communication/messages/parser/inventory/trading/TradingYouAreNotAllowedEventParser.as
 * (obfuscated as `_SafeCls_3671`'s parser in the primary tree)
 */
export class TradingYouAreNotAllowedEventParser implements IMessageParser
{
    // AS3: .../TradingYouAreNotAllowedEventParser.as::flush()
    flush(): boolean
    {
        return true;
    }

    // AS3: .../TradingYouAreNotAllowedEventParser.as::parse()
    // AS3 reads nothing from the wrapper.
    parse(_wrapper: IMessageDataWrapper): boolean
    {
        return true;
    }
}

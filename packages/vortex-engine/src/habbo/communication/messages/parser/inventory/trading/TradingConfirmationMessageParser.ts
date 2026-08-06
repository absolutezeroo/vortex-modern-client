import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * Parser for trading confirmation message
 *
 * @see source_as_win63/habbo/communication/messages/parser/inventory/trading/TradingConfirmationEventParser.as
 */
export class TradingConfirmationMessageParser implements IMessageParser
{
    // AS3: sources/win63_version/habbo/communication/messages/parser/inventory/trading/TradingConfirmationEventParser.as::flush()
    flush(): boolean
    {
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/inventory/trading/TradingConfirmationEventParser.as::parse()
    parse(_wrapper: IMessageDataWrapper): boolean
    {
        return true;
    }
}

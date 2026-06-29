import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * Parser for trading completed message
 *
 * @see source_as_win63/habbo/communication/messages/parser/inventory/trading/TradingCompletedEventParser.as
 */
export class TradingCompletedMessageParser implements IMessageParser
{
	flush(): boolean
	{
		return true;
	}

	parse(_wrapper: IMessageDataWrapper): boolean
	{
		return true;
	}
}

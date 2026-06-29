import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for restore client message
 *
 * Empty parser - no data fields to parse.
 *
 * @see source_as_win63/habbo/communication/messages/parser/notifications/RestoreClientMessageEventParser.as
 */
export class RestoreClientMessageEventParser implements IMessageParser
{
	flush(): boolean
	{
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		if (!wrapper) return false;

		return true;
	}
}

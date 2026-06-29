import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for room event cancel message
 *
 * @see source_as_win63/habbo/communication/messages/parser/navigator/RoomEventCancelEventParser.as
 */
export class RoomEventCancelMessageParser implements IMessageParser
{
	flush(): boolean
	{
		return true;
	}

	parse(_wrapper: IMessageDataWrapper): boolean
	{
		// No data to parse
		return true;
	}
}

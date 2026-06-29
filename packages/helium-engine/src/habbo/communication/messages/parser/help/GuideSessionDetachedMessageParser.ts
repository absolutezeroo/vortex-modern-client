import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for guide session detached messages.
 * Empty message indicating that the guide session has been detached.
 *
 * @see source_as_win63/habbo/communication/messages/parser/help/GuideSessionDetachedMessageEventParser.as
 */
export class GuideSessionDetachedMessageParser implements IMessageParser
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

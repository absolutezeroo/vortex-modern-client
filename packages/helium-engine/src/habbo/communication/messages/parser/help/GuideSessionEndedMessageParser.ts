import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for guide session ended messages.
 * Contains the reason why the guide session ended.
 *
 * @see source_as_win63/habbo/communication/messages/parser/help/GuideSessionEndedMessageEventParser.as
 */
export class GuideSessionEndedMessageParser implements IMessageParser
{
	private _endReason: number = 0;

	get endReason(): number
	{
		return this._endReason;
	}

	flush(): boolean
	{
		this._endReason = 0;
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		if (!wrapper) return false;

		this._endReason = wrapper.readInt();

		return true;
	}
}

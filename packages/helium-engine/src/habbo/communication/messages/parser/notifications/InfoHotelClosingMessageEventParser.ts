import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for hotel closing notification
 *
 * Parses the number of minutes until the hotel closes.
 *
 * @see source_as_win63/habbo/communication/messages/parser/availability/InfoHotelClosingMessageEventParser.as
 */
export class InfoHotelClosingMessageEventParser implements IMessageParser
{
	private _minutesUntilClosing: number = 0;

	get minutesUntilClosing(): number
	{
		return this._minutesUntilClosing;
	}

	flush(): boolean
	{
		this._minutesUntilClosing = 0;
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		if (!wrapper) return false;

		this._minutesUntilClosing = wrapper.readInt();

		return true;
	}
}

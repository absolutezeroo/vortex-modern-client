import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for hotel closed notification
 *
 * Parses the opening hour, opening minute, and whether the user was thrown out at close.
 *
 * @see source_as_win63/habbo/communication/messages/parser/availability/InfoHotelClosedMessageEventParser.as
 */
export class InfoHotelClosedMessageEventParser implements IMessageParser
{
	private _openHour: number = 0;

	get openHour(): number
	{
		return this._openHour;
	}

	private _openMinute: number = 0;

	get openMinute(): number
	{
		return this._openMinute;
	}

	private _userThrownOutAtClose: boolean = false;

	get userThrownOutAtClose(): boolean
	{
		return this._userThrownOutAtClose;
	}

	flush(): boolean
	{
		this._openHour = 0;
		this._openMinute = 0;
		this._userThrownOutAtClose = false;
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		if (!wrapper) return false;

		this._openHour = wrapper.readInt();
		this._openMinute = wrapper.readInt();
		this._userThrownOutAtClose = wrapper.readBoolean();

		return true;
	}
}

import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for is first login of day message
 *
 * @see source_as_win63/habbo/communication/messages/parser/handshake/IsFirstLoginOfDayEventParser.as
 */
export class IsFirstLoginOfDayMessageParser implements IMessageParser
{
	private _isFirstLoginOfDay: boolean = false;

	get isFirstLoginOfDay(): boolean
	{
		return this._isFirstLoginOfDay;
	}

	flush(): boolean
	{
		this._isFirstLoginOfDay = false;
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		this._isFirstLoginOfDay = wrapper.readBoolean();
		return true;
	}
}

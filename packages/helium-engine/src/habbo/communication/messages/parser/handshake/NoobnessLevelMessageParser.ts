import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for noobness level message
 * Indicates user's experience level (new user status)
 *
 * @see source_as_win63/habbo/communication/messages/parser/handshake/NoobnessLevelMessageEventParser.as
 */
export class NoobnessLevelMessageParser implements IMessageParser
{
	private _noobnessLevel: number = 0;

	get noobnessLevel(): number
	{
		return this._noobnessLevel;
	}

	flush(): boolean
	{
		this._noobnessLevel = 0;
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		this._noobnessLevel = wrapper.readInt();
		return true;
	}
}

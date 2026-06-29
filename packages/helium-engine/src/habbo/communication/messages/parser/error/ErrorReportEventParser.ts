import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for error report event
 *
 * @see source_as_win63/habbo/communication/messages/parser/error/ErrorReportEventParser.as
 */
export class ErrorReportEventParser implements IMessageParser
{
	private _errorCode: number = 0;

	get errorCode(): number
	{
		return this._errorCode;
	}

	private _messageId: number = 0;

	get messageId(): number
	{
		return this._messageId;
	}

	private _timestamp: string = '';

	get timestamp(): string
	{
		return this._timestamp;
	}

	flush(): boolean
	{
		this._errorCode = 0;
		this._messageId = 0;
		this._timestamp = '';
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		this._messageId = wrapper.readInt();
		this._errorCode = wrapper.readInt();
		this._timestamp = wrapper.readString();
		return true;
	}
}

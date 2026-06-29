import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for instant message error events.
 * Contains the error code, user ID, and original message.
 *
 * @see source_as_win63/habbo/communication/messages/parser/friendlist/InstantMessageErrorEventParser.as
 */
export class InstantMessageErrorEventParser implements IMessageParser
{
	private _errorCode: number = 0;

	get errorCode(): number
	{
		return this._errorCode;
	}

	private _userId: number = 0;

	get userId(): number
	{
		return this._userId;
	}

	private _message: string = '';

	get message(): string
	{
		return this._message;
	}

	flush(): boolean
	{
		this._errorCode = 0;
		this._userId = 0;
		this._message = '';
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		if (!wrapper) return false;

		this._errorCode = wrapper.readInt();
		this._userId = wrapper.readInt();
		this._message = wrapper.readString();

		return true;
	}
}

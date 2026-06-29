/**
 * UserTypingMessageEventParser
 *
 * Based on AS3: com.sulake.habbo.communication.messages.parser.room.chat.UserTypingMessageEventParser
 */
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

export class UserTypingMessageEventParser implements IMessageParser
{
	private _userId: number = 0;

	get userId(): number
	{
		return this._userId;
	}

	private _isTyping: boolean = false;

	get isTyping(): boolean
	{
		return this._isTyping;
	}

	flush(): boolean
	{
		this._userId = 0;
		this._isTyping = false;
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		if (wrapper === null)
		{
			return false;
		}

		this._userId = wrapper.readInt();
		this._isTyping = wrapper.readInt() === 1;

		return true;
	}
}

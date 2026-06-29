import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for follow friend failed messages.
 * Contains an error code indicating the reason for failure.
 *
 * @see source_as_win63/habbo/communication/messages/parser/friendlist/FollowFriendFailedMessageParser.as
 */
export class FollowFriendFailedMessageParser implements IMessageParser
{
	private _errorCode: number = 0;

	get errorCode(): number
	{
		return this._errorCode;
	}

	flush(): boolean
	{
		this._errorCode = 0;
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		if (!wrapper) return false;

		this._errorCode = wrapper.readInt();

		return true;
	}
}

import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * Parser for ignored users list.
 *
 * Based on AS3: com.sulake.habbo.communication.messages.parser.users.IgnoredUsersMessageEventParser
 */
export class IgnoredUsersMessageParser implements IMessageParser
{
	private _ignoredUsers: number[] = [];

	get ignoredUsers(): number[]
	{
		return this._ignoredUsers.slice();
	}

	flush(): boolean
	{
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		if (!wrapper)
		{
			return false;
		}

		this._ignoredUsers = [];

		const count = wrapper.readInt();

		for (let i = 0; i < count; i++)
		{
			this._ignoredUsers.push(wrapper.readInt());
		}

		return true;
	}
}

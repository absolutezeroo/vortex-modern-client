import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * HabboUserBadgesMessageParser
 *
 * Based on AS3:
 * - com.sulake.habbo.communication.messages.parser.users.HabboUserBadgesMessageEventParser
 * - com.sulake.habbo.communication.messages.parser.users.HabboUserBadgesMessageParser
 */
export class HabboUserBadgesMessageParser implements IMessageParser
{
	private _userId: number = -1;
	private _badges: string[] = [];

	get userId(): number
	{
		return this._userId;
	}

	get badges(): string[]
	{
		return this._badges;
	}

	flush(): boolean
	{
		this._userId = -1;
		this._badges = [];
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		if(!wrapper) return false;

		this._userId = wrapper.readInt();
		this._badges = [];

		const count = wrapper.readInt();

		for(let i = 0; i < count; i++)
		{
			wrapper.readInt(); // slot id
			this._badges.push(wrapper.readString());
		}

		return true;
	}
}

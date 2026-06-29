import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * HabboGroupJoinFailedMessageParser
 *
 * Based on AS3:
 * - com.sulake.habbo.communication.messages.parser.users.HabboGroupJoinFailedMessageEventParser
 * - com.sulake.habbo.communication.messages.parser.users.HabboGroupJoinFailedMessageParser
 */
export class HabboGroupJoinFailedMessageParser implements IMessageParser
{
	public static readonly INSUFFICIENT_SUBSCRIPTION_LEVEL = 4;

	private _reason: number = 0;

	get reason(): number
	{
		return this._reason;
	}

	flush(): boolean
	{
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		if(!wrapper) return false;

		this._reason = wrapper.readInt();
		return true;
	}
}

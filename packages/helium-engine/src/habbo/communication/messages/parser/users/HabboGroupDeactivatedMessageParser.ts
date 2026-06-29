import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * HabboGroupDeactivatedMessageParser
 *
 * Based on AS3:
 * - com.sulake.habbo.communication.messages.parser.users.HabboGroupDeactivatedMessageEventParser
 * - com.sulake.habbo.communication.messages.parser.users.HabboGroupDeactivatedMessageParser
 */
export class HabboGroupDeactivatedMessageParser implements IMessageParser
{
	private _groupId: number = 0;

	get groupId(): number
	{
		return this._groupId;
	}

	flush(): boolean
	{
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		if(!wrapper) return false;

		this._groupId = wrapper.readInt();
		return true;
	}
}

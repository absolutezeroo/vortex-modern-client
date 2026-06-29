import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * ChangeEmailResultParser
 *
 * Based on AS3:
 * - com.sulake.habbo.communication.messages.parser.users.ChangeEmailResultEventParser
 * - com.sulake.habbo.communication.messages.parser.users.ChangeEmailResultParser
 */
export class ChangeEmailResultParser implements IMessageParser
{
	public static readonly EMAIL_STATUS_OK = 0;

	private _result: number = 0;

	get result(): number
	{
		return this._result;
	}

	flush(): boolean
	{
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		if(!wrapper) return false;

		this._result = wrapper.readInt();
		return true;
	}
}

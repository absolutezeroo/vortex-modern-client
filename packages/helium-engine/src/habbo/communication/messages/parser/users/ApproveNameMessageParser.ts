import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * ApproveNameMessageParser
 *
 * Based on AS3:
 * - com.sulake.habbo.communication.messages.parser.users.ApproveNameMessageEventParser
 * - com.sulake.habbo.communication.messages.parser.users.ApproveNameMessageParser
 */
export class ApproveNameMessageParser implements IMessageParser
{
	private _result: number = -1;
	private _nameValidationInfo: string | null = null;

	get result(): number
	{
		return this._result;
	}

	get nameValidationInfo(): string | null
	{
		return this._nameValidationInfo;
	}

	flush(): boolean
	{
		this._result = -1;
		this._nameValidationInfo = null;
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		if(!wrapper) return false;

		this._result = wrapper.readInt();
		this._nameValidationInfo = wrapper.readString();
		return true;
	}
}

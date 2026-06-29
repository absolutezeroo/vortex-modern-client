import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * Parser for block/unblock update.
 *
 * @see sources/win63_version/habbo/communication/messages/parser/users/BlockUserUpdateMessageEventParser.as
 */
export class BlockUserUpdateMessageParser implements IMessageParser
{
	private _result: number = -1;
	private _userId: number = 0;

	get result(): number
	{
		return this._result;
	}

	get userId(): number
	{
		return this._userId;
	}

	flush(): boolean
	{
		this._result = -1;
		this._userId = 0;
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		if (!wrapper) return false;

		this._result = wrapper.readInt();
		this._userId = wrapper.readInt();
		return true;
	}
}

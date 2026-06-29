import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {AcceptFriendFailureData} from './AcceptFriendFailureData';

/**
 * Parser for accept friend request result.
 * Contains a list of failures (if any).
 *
 * @see source_as_win63/habbo/communication/messages/parser/friendlist/AcceptFriendResultMessageParser.as
 */
export class AcceptFriendResultMessageParser implements IMessageParser
{
	private _failures: AcceptFriendFailureData[] = [];

	get failures(): AcceptFriendFailureData[]
	{
		return this._failures;
	}

	flush(): boolean
	{
		this._failures = [];
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		if (!wrapper) return false;

		const count = wrapper.readInt();

		for (let i = 0; i < count; i++)
		{
			this._failures.push(new AcceptFriendFailureData(wrapper));
		}

		return true;
	}
}

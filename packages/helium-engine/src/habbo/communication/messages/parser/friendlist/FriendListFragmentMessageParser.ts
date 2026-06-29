import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {FriendData} from './FriendData';

/**
 * Parser for friend list fragment messages.
 * The server sends the friend list in multiple fragments.
 *
 * @see source_as_win63/habbo/communication/messages/parser/friendlist/FriendsListFragmentMessageParser.as
 */
export class FriendListFragmentMessageParser implements IMessageParser
{
	private _totalFragments: number = 0;

	get totalFragments(): number
	{
		return this._totalFragments;
	}

	private _fragmentIndex: number = 0;

	get fragmentIndex(): number
	{
		return this._fragmentIndex;
	}

	private _friendFragment: FriendData[] = [];

	get friendFragment(): FriendData[]
	{
		return this._friendFragment;
	}

	flush(): boolean
	{
		this._totalFragments = 0;
		this._fragmentIndex = 0;
		this._friendFragment = [];
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		if (!wrapper) return false;

		this._totalFragments = wrapper.readInt();
		this._fragmentIndex = wrapper.readInt();

		const friendCount = wrapper.readInt();

		for (let i = 0; i < friendCount; i++)
		{
			this._friendFragment.push(new FriendData(wrapper));
		}

		return true;
	}
}

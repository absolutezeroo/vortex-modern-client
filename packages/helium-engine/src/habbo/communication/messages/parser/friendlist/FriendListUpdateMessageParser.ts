import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {FriendCategoryData} from './MessengerInitParser';
import {FriendData} from './FriendData';

/**
 * Parser for friend list update messages.
 * Contains category updates, removed friend IDs, added friends, and updated friends.
 *
 * @see source_as_win63/habbo/communication/messages/parser/friendlist/FriendListUpdateMessageParser.as
 */
export class FriendListUpdateMessageParser implements IMessageParser
{
	private _categories: FriendCategoryData[] = [];

	get categories(): FriendCategoryData[]
	{
		return this._categories;
	}

	private _removedFriendIds: number[] = [];

	get removedFriendIds(): number[]
	{
		return this._removedFriendIds;
	}

	private _addedFriends: FriendData[] = [];

	get addedFriends(): FriendData[]
	{
		return this._addedFriends;
	}

	private _updatedFriends: FriendData[] = [];

	get updatedFriends(): FriendData[]
	{
		return this._updatedFriends;
	}

	flush(): boolean
	{
		this._categories = [];
		this._removedFriendIds = [];
		this._addedFriends = [];
		this._updatedFriends = [];
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		if (!wrapper) return false;

		const numCategories = wrapper.readInt();

		for (let i = 0; i < numCategories; i++)
		{
			this._categories.push(new FriendCategoryData(wrapper));
		}

		const numFriends = wrapper.readInt();

		for (let j = 0; j < numFriends; j++)
		{
			const actionType = wrapper.readInt();

			if (actionType === -1)
			{
				const removedFriendId = wrapper.readInt();
				this._removedFriendIds.push(removedFriendId);
			}
			else if (actionType === 0)
			{
				this._updatedFriends.push(new FriendData(wrapper));
			}
			else if (actionType === 1)
			{
				this._addedFriends.push(new FriendData(wrapper));
			}
		}

		return true;
	}
}

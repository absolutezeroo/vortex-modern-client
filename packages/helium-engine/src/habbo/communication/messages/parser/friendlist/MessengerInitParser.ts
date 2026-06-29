import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Data class for friend categories
 *
 * @see source_as_win63/habbo/communication/messages/incoming/friendlist/FriendCategoryData.as
 */
export class FriendCategoryData
{
	constructor(wrapper: IMessageDataWrapper)
	{
		this._id = wrapper.readInt();
		this._name = wrapper.readString();
	}

	private _id: number;

	get id(): number
	{
		return this._id;
	}

	private _name: string;

	get name(): string
	{
		return this._name;
	}
}

/**
 * Parser for messenger initialization data.
 * Contains friend limits and friend categories.
 *
 * @see source_as_win63/habbo/communication/messages/parser/friendlist/MessengerInitParser.as
 */
export class MessengerInitParser implements IMessageParser
{
	private _userFriendLimit: number = 0;

	get userFriendLimit(): number
	{
		return this._userFriendLimit;
	}

	private _normalFriendLimit: number = 0;

	get normalFriendLimit(): number
	{
		return this._normalFriendLimit;
	}

	private _extendedFriendLimit: number = 0;

	get extendedFriendLimit(): number
	{
		return this._extendedFriendLimit;
	}

	private _categories: FriendCategoryData[] = [];

	get categories(): FriendCategoryData[]
	{
		return this._categories;
	}

	flush(): boolean
	{
		this._categories = [];
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		if (!wrapper) return false;

		this._userFriendLimit = wrapper.readInt();
		this._normalFriendLimit = wrapper.readInt();
		this._extendedFriendLimit = wrapper.readInt();

		const categoryCount = wrapper.readInt();

		for (let i = 0; i < categoryCount; i++)
		{
			this._categories.push(new FriendCategoryData(wrapper));
		}

		return true;
	}
}

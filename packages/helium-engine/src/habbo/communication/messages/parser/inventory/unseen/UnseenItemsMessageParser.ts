import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * Parser for unseen items message
 *
 * @see source_as_win63/habbo/communication/messages/parser/notifications/UnseenItemsEventParser.as
 */
export class UnseenItemsMessageParser implements IMessageParser
{
	private _categories: Map<number, number[]> = new Map();

	get categories(): Map<number, number[]>
	{
		return this._categories;
	}

	flush(): boolean
	{
		this._categories.clear();
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		const categoryCount = wrapper.readInt();

		for (let i = 0; i < categoryCount; i++)
		{
			const category = wrapper.readInt();
			const itemCount = wrapper.readInt();
			const itemIds: number[] = [];

			for (let j = 0; j < itemCount; j++)
			{
				itemIds.push(wrapper.readInt());
			}

			this._categories.set(category, itemIds);
		}

		return true;
	}
}

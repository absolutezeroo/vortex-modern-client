import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Represents a single CFH topic within a category.
 *
 * @see source_as_win63/habbo/communication/messages/incoming/callforhelp/class_1785.as
 */
export interface CfhTopic
{
	name: string;
	id: number;
	consequence: string;
}

/**
 * Represents a CFH category containing multiple topics.
 *
 * @see source_as_win63/habbo/communication/messages/incoming/callforhelp/class_1746.as
 */
export interface CfhCategory
{
	name: string;
	topics: CfhTopic[];
}

/**
 * Parser for CFH topics initialization messages.
 * Contains the full category/topic tree for the call for help system.
 *
 * @see source_as_win63/habbo/communication/messages/parser/callforhelp/CfhTopicsInitMessageEventParser.as
 */
export class CfhTopicsInitMessageParser implements IMessageParser
{
	private _callForHelpCategories: CfhCategory[] = [];

	get callForHelpCategories(): CfhCategory[]
	{
		return this._callForHelpCategories;
	}

	flush(): boolean
	{
		this._callForHelpCategories = [];
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		if (!wrapper) return false;

		this._callForHelpCategories = [];

		const categoryCount = wrapper.readInt();

		for (let i = 0; i < categoryCount; i++)
		{
			const name = wrapper.readString();
			const topicCount = wrapper.readInt();
			const topics: CfhTopic[] = [];

			for (let j = 0; j < topicCount; j++)
			{
				const topicName = wrapper.readString();
				const topicId = wrapper.readInt();
				const consequence = wrapper.readString();

				topics.push({name: topicName, id: topicId, consequence});
			}

			this._callForHelpCategories.push({name, topics});
		}

		return true;
	}
}

import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for collapsed categories message
 *
 * @see source_as_win63/habbo/communication/messages/parser/newnavigator/class_1590.as
 */
export class NavigatorCollapsedCategoriesMessageParser implements IMessageParser
{
	private _collapsedCategories: string[] = [];

	get collapsedCategories(): string[]
	{
		return this._collapsedCategories;
	}

	flush(): boolean
	{
		this._collapsedCategories = [];
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		const count = wrapper.readInt();
		for (let i = 0; i < count; i++)
		{
			this._collapsedCategories.push(wrapper.readString());
		}
		return true;
	}
}

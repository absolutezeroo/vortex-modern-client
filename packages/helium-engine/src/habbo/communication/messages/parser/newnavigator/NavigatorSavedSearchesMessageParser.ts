import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {NavigatorSavedSearch} from '../../incoming/newnavigator';

/**
 * Parser for saved searches message
 *
 * @see source_as_win63/habbo/communication/messages/parser/newnavigator/class_1264.as
 */
export class NavigatorSavedSearchesMessageParser implements IMessageParser
{
	private _savedSearches: NavigatorSavedSearch[] = [];

	get savedSearches(): NavigatorSavedSearch[]
	{
		return this._savedSearches;
	}

	flush(): boolean
	{
		this._savedSearches = [];
		return true;
	}

	parse(wrapper: IMessageDataWrapper): boolean
	{
		const count = wrapper.readInt();
		for (let i = 0; i < count; i++)
		{
			this._savedSearches.push(new NavigatorSavedSearch(wrapper));
		}
		return true;
	}
}

import type {IMessageDataWrapper} from '@core/communication';
import {NavigatorSavedSearch} from './NavigatorSavedSearch';

/**
 * Top level context in the navigator (e.g., "official_view", "hotel_view")
 *
 * Based on AS3 package_25.class_3644
 */
export class NavigatorTopLevelContext
{
	constructor(wrapper: IMessageDataWrapper)
	{
		this._searchCode = wrapper.readString();

		const count = wrapper.readInt();

		for (let i = 0; i < count; i++)
		{
			this._savedSearches.push(new NavigatorSavedSearch(wrapper));
		}
	}

	private _searchCode: string = '';

	get searchCode(): string
	{
		return this._searchCode;
	}

	private _savedSearches: NavigatorSavedSearch[] = [];

	get savedSearches(): NavigatorSavedSearch[]
	{
		return this._savedSearches;
	}

	get quickLinks(): NavigatorSavedSearch[]
	{
		return this._savedSearches;
	}
}

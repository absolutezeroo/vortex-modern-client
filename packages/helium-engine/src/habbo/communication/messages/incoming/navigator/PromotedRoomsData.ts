import type {IMessageDataWrapper} from '@core/communication';
import type {INavigatorSearchResultData} from './INavigatorSearchResultData';
import {PromotedRoomCategoryData} from './PromotedRoomCategoryData';

/**
 * Promoted rooms data list
 *
 * Based on AS3 com.sulake.habbo.communication.messages.incoming.navigator.class_1691
 */
export class PromotedRoomsData implements INavigatorSearchResultData
{
	constructor(wrapper: IMessageDataWrapper)
	{
		const count = wrapper.readInt();
		for (let i = 0; i < count; i++)
		{
			this._entries.push(new PromotedRoomCategoryData(wrapper));
		}
	}

	private _entries: PromotedRoomCategoryData[] = [];

	get entries(): PromotedRoomCategoryData[]
	{
		return this._entries;
	}

	private _disposed: boolean = false;

	get disposed(): boolean
	{
		return this._disposed;
	}

	dispose(): void
	{
		if (this._disposed)
		{
			return;
		}
		this._disposed = true;

		for (const entry of this._entries)
		{
			entry.dispose();
		}
		this._entries = [];
	}
}

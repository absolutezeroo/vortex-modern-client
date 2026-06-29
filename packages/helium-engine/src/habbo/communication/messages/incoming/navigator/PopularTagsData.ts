import type {IMessageDataWrapper} from '@core/communication';
import type {INavigatorSearchResultData} from './INavigatorSearchResultData';
import {RoomTagData} from './RoomTagData';

/**
 * Popular room tags data
 *
 * Based on AS3 com.sulake.habbo.communication.messages.incoming.navigator.class_1727
 */
export class PopularTagsData implements INavigatorSearchResultData
{
	constructor(wrapper: IMessageDataWrapper)
	{
		const count = wrapper.readInt();
		for (let i = 0; i < count; i++)
		{
			this._tags.push(new RoomTagData(wrapper));
		}
	}

	private _tags: RoomTagData[] = [];

	get tags(): RoomTagData[]
	{
		return this._tags;
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
		this._tags = [];
	}
}

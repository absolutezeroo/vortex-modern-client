import type {IMessageDataWrapper} from '@core/communication';
import type {INavigatorSearchResultData} from './INavigatorSearchResultData';
import {OfficialRoomEntryData} from './OfficialRoomEntryData';

/**
 * Official rooms data list
 *
 * Based on AS3 com.sulake.habbo.communication.messages.incoming.navigator.class_1663
 */
export class OfficialRoomsData implements INavigatorSearchResultData
{
	constructor(wrapper: IMessageDataWrapper)
	{
		const count = wrapper.readInt();
		for (let i = 0; i < count; i++)
		{
			this._entries.push(new OfficialRoomEntryData(wrapper));
		}
	}

	private _entries: OfficialRoomEntryData[] = [];

	get entries(): OfficialRoomEntryData[]
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

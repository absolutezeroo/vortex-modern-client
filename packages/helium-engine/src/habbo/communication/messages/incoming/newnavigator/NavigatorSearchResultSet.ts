import type {IMessageDataWrapper} from '@core/communication';
import {NavigatorSearchResultBlock} from './NavigatorSearchResultBlock';
import type {GuestRoomData} from '../navigator/GuestRoomData';

/**
 * A complete set of search results from the new navigator
 *
 */
export class NavigatorSearchResultSet
{
	constructor(wrapper: IMessageDataWrapper)
	{
		this._searchCode = wrapper.readString();
		this._filteringData = wrapper.readString();

		const count = wrapper.readInt();

		for (let i = 0; i < count; i++)
		{
			this._blocks.push(new NavigatorSearchResultBlock(wrapper));
		}
	}

	private _searchCode: string = '';

	get searchCode(): string
	{
		return this._searchCode;
	}

	/**
	 * AS3 compatibility alias.
	 *
	 * @see sources/win63_version/habbo/communication/messages/incoming/newnavigator/class_1652.as
	 */
	get searchCodeOriginal(): string
	{
		return this._searchCode;
	}

	private _filteringData: string = '';

	get filteringData(): string
	{
		return this._filteringData;
	}

	private _blocks: NavigatorSearchResultBlock[] = [];

	get blocks(): NavigatorSearchResultBlock[]
	{
		return this._blocks;
	}

	/**
	 * AS3 compatibility alias (class_3439.resultSet).
	 */
	get resultSet(): NavigatorSearchResultSet
	{
		return this;
	}

	/**
	 * Find a guest room across all blocks
	 */
	findGuestRoom(flatId: number): GuestRoomData | null
	{
		for (const block of this._blocks)
		{
			const room = block.findGuestRoom(flatId);

			if (room)
			{
				return room;
			}
		}

		return null;
	}

	/**
	 * Get all rooms from all blocks
	 */
	getAllRooms(): GuestRoomData[]
	{
		const rooms: GuestRoomData[] = [];

		for (const block of this._blocks)
		{
			rooms.push(...block.guestRooms);
		}

		return rooms;
	}
}

import type {IMessageDataWrapper} from '@core/communication';
import {GuestRoomData} from '../navigator/GuestRoomData';

/**
 * Action allowed constants
 */
export const NavigatorSearchAction = {
	NONE: 0,
	SHOW_MORE: 1,
	GO_BACK: 2,
} as const;

/**
 * A block of search results in the navigator
 *
 * Based on AS3 class_1770
 */
export class NavigatorSearchResultBlock
{
	constructor(wrapper: IMessageDataWrapper)
	{
		this._searchCode = wrapper.readString();
		this._text = wrapper.readString();
		this._actionAllowed = wrapper.readInt();
		this._forceClosed = wrapper.readBoolean();
		this._viewMode = wrapper.readInt();

		const count = wrapper.readInt();

		for (let i = 0; i < count; i++)
		{
			this._guestRooms.push(new GuestRoomData(wrapper));
		}
	}

	private _searchCode: string = '';

	get searchCode(): string
	{
		return this._searchCode;
	}

	private _text: string = '';

	get text(): string
	{
		return this._text;
	}

	private _actionAllowed: number = 0;

	get actionAllowed(): number
	{
		return this._actionAllowed;
	}

	private _forceClosed: boolean = false;

	get forceClosed(): boolean
	{
		return this._forceClosed;
	}

	private _viewMode: number = 0;

	get viewMode(): number
	{
		return this._viewMode;
	}

	set viewMode(value: number)
	{
		this._viewMode = value;
	}

	private _guestRooms: GuestRoomData[] = [];

	get guestRooms(): GuestRoomData[]
	{
		return this._guestRooms;
	}

	findGuestRoom(flatId: number): GuestRoomData | null
	{
		for (const room of this._guestRooms)
		{
			if (room.flatId === flatId)
			{
				return room;
			}
		}
		return null;
	}
}

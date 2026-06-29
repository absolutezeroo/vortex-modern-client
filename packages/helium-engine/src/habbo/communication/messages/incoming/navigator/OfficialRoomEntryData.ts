import type {IMessageDataWrapper} from '@core/communication';
import {GuestRoomData} from './GuestRoomData';

/**
 * Official room entry type constants
 */
export const OfficialRoomEntryType = {
	TAG: 1,
	GUEST_ROOM: 2,
	FOLDER: 4,
} as const;

/**
 * Official room entry data
 *
 * Based on AS3 com.sulake.habbo.communication.messages.incoming.navigator.class_1653
 */
export class OfficialRoomEntryData
{
	constructor(wrapper: IMessageDataWrapper)
	{
		this._index = wrapper.readInt();
		this._popupCaption = wrapper.readString();
		this._popupDesc = wrapper.readString();
		this._showDetails = wrapper.readInt() === 1;
		this._picText = wrapper.readString();
		this._picRef = wrapper.readString();
		this._folderId = wrapper.readInt();
		this._userCount = wrapper.readInt();
		this._type = wrapper.readInt();

		if (this._type === OfficialRoomEntryType.TAG)
		{
			this._tag = wrapper.readString();
		}
		else if (this._type === OfficialRoomEntryType.GUEST_ROOM)
		{
			this._guestRoomData = new GuestRoomData(wrapper);
		}
		else
		{
			this._open = wrapper.readBoolean();
		}
	}

	private _index: number = 0;

	get index(): number
	{
		return this._index;
	}

	private _popupCaption: string = '';

	get popupCaption(): string
	{
		return this._popupCaption;
	}

	private _popupDesc: string = '';

	get popupDesc(): string
	{
		return this._popupDesc;
	}

	private _showDetails: boolean = false;

	get showDetails(): boolean
	{
		return this._showDetails;
	}

	private _picText: string = '';

	get picText(): string
	{
		return this._picText;
	}

	private _picRef: string = '';

	get picRef(): string
	{
		return this._picRef;
	}

	private _folderId: number = 0;

	get folderId(): number
	{
		return this._folderId;
	}

	private _userCount: number = 0;

	get userCount(): number
	{
		return this._userCount;
	}

	private _type: number = 0;

	get type(): number
	{
		return this._type;
	}

	private _tag: string = '';

	get tag(): string
	{
		return this._tag;
	}

	private _guestRoomData: GuestRoomData | null = null;

	get guestRoomData(): GuestRoomData | null
	{
		return this._guestRoomData;
	}

	private _open: boolean = false;

	get open(): boolean
	{
		return this._open;
	}

	private _disposed: boolean = false;

	get disposed(): boolean
	{
		return this._disposed;
	}

	get maxUsers(): number
	{
		if (this._type === OfficialRoomEntryType.TAG)
		{
			return 0;
		}
		if (this._type === OfficialRoomEntryType.GUEST_ROOM && this._guestRoomData)
		{
			return this._guestRoomData.maxUserCount;
		}
		return 0;
	}

	toggleOpen(): void
	{
		this._open = !this._open;
	}

	dispose(): void
	{
		if (this._disposed)
		{
			return;
		}
		this._disposed = true;
		if (this._guestRoomData)
		{
			this._guestRoomData.dispose();
			this._guestRoomData = null;
		}
	}
}

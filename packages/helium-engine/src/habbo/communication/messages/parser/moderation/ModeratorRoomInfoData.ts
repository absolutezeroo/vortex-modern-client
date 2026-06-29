import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {RoomDataData} from './RoomDataData';

/**
 * Data class containing room information for moderators.
 *
 * @see source_as_win63/habbo/communication/messages/incoming/moderation/class_1749.as
 */
export class ModeratorRoomInfoData
{
	constructor(wrapper: IMessageDataWrapper)
	{
		this._flatId = wrapper.readInt();
		this._userCount = wrapper.readInt();
		this._ownerInRoom = wrapper.readBoolean();
		this._ownerId = wrapper.readInt();
		this._ownerName = wrapper.readString();
		this._room = new RoomDataData(wrapper);
	}

	private _flatId: number;

	get flatId(): number
	{
		return this._flatId;
	}

	private _userCount: number;

	get userCount(): number
	{
		return this._userCount;
	}

	private _ownerInRoom: boolean;

	get ownerInRoom(): boolean
	{
		return this._ownerInRoom;
	}

	private _ownerId: number;

	get ownerId(): number
	{
		return this._ownerId;
	}

	private _ownerName: string;

	get ownerName(): string
	{
		return this._ownerName;
	}

	private _room: RoomDataData;

	get room(): RoomDataData
	{
		return this._room;
	}
}

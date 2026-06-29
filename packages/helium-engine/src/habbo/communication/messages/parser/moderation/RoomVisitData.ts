import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Data class for a room visit entry.
 *
 * @see source_as_win63/habbo/communication/messages/incoming/moderation/class_1775.as
 */
export class RoomVisitData
{
	constructor(wrapper: IMessageDataWrapper)
	{
		this._roomId = wrapper.readInt();
		this._roomName = wrapper.readString();
		this._enterHour = wrapper.readInt();
		this._enterMinute = wrapper.readInt();
	}

	private _roomId: number;

	get roomId(): number
	{
		return this._roomId;
	}

	private _roomName: string;

	get roomName(): string
	{
		return this._roomName;
	}

	private _enterHour: number;

	get enterHour(): number
	{
		return this._enterHour;
	}

	private _enterMinute: number;

	get enterMinute(): number
	{
		return this._enterMinute;
	}
}

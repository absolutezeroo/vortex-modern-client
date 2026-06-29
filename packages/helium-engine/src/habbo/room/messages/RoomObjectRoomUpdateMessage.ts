/**
 * RoomObjectRoomUpdateMessage
 *
 * @see source_as_win63/habbo/room/messages/RoomObjectRoomUpdateMessage.as
 *
 * Update message for room wall/floor/landscape texture changes.
 */
import {RoomObjectUpdateMessage} from '@room/messages/RoomObjectUpdateMessage';

export class RoomObjectRoomUpdateMessage extends RoomObjectUpdateMessage
{
	public static readonly ROOM_WALL_UPDATE = 'RORUM_ROOM_WALL_UPDATE';
	public static readonly ROOM_FLOOR_UPDATE = 'RORUM_ROOM_FLOOR_UPDATE';
	public static readonly ROOM_LANDSCAPE_UPDATE = 'RORUM_ROOM_LANDSCAPE_UPDATE';

	constructor(type: string, value: string)
	{
		super(null, null);
		this._type = type;
		this._value = value;
	}

	private _type: string = '';

	get type(): string
	{
		return this._type;
	}

	private _value: string = '';

	get value(): string
	{
		return this._value;
	}
}

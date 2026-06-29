/**
 * RoomObjectRoomPlanePropertyUpdateMessage
 *
 * @see source_as_win63/habbo/room/messages/RoomObjectRoomPlanePropertyUpdateMessage.as
 *
 * Update message for room plane properties (wall/floor thickness).
 */
import {RoomObjectUpdateMessage} from '@room/messages/RoomObjectUpdateMessage';

export class RoomObjectRoomPlanePropertyUpdateMessage extends RoomObjectUpdateMessage
{
	public static readonly WALL_THICKNESS = 'RORPPUM_WALL_THICKNESS';
	public static readonly FLOOR_THICKNESS = 'RORPVUM_FLOOR_THICKNESS';

	constructor(type: string, value: number)
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

	private _value: number = 0;

	get value(): number
	{
		return this._value;
	}
}

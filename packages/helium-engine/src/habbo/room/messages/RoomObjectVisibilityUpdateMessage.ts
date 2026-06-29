/**
 * RoomObjectVisibilityUpdateMessage
 *
 * @see source_as_win63/habbo/room/messages/RoomObjectVisibilityUpdateMessage.as
 *
 * Update message for object visibility changes.
 */
import {RoomObjectUpdateMessage} from '@room/messages/RoomObjectUpdateMessage';

export class RoomObjectVisibilityUpdateMessage extends RoomObjectUpdateMessage
{
	public static readonly ENABLED = 'ROVUM_ENABLED';
	public static readonly DISABLED = 'ROVUM_DISABLED';

	constructor(type: string)
	{
		super(null, null);
		this._type = type;
	}

	private _type: string;

	get type(): string
	{
		return this._type;
	}
}

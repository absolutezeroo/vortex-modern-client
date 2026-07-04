/**
 * RoomWidgetOpenProfileMessage
 *
 * @see sources/win63_version/habbo/ui/widget/messages/RoomWidgetOpenProfileMessage.as
 */
import {RoomWidgetMessage} from './RoomWidgetMessage';

export class RoomWidgetOpenProfileMessage extends RoomWidgetMessage
{
	// AS3: sources/win63_version/habbo/ui/widget/messages/RoomWidgetOpenProfileMessage.as::const_815
	public static readonly OPEN_USER_PROFILE: string = 'RWOPEM_OPEN_USER_PROFILE';

	private _userId: number;
	private _trackingLocation: string;

	// AS3: sources/win63_version/habbo/ui/widget/messages/RoomWidgetOpenProfileMessage.as::RoomWidgetOpenProfileMessage()
	constructor(type: string, userId: number, trackingLocation: string)
	{
		super(type);
		this._userId = userId;
		this._trackingLocation = trackingLocation;
	}

	public get userId(): number
	{
		return this._userId;
	}

	public get trackingLocation(): string
	{
		return this._trackingLocation;
	}
}

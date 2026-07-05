/**
 * RoomWidgetFloodControlEvent
 *
 * @see sources/win63_version/habbo/ui/widget/events/RoomWidgetFloodControlEvent.as
 */
import {RoomWidgetUpdateEvent} from './RoomWidgetUpdateEvent';

export class RoomWidgetFloodControlEvent extends RoomWidgetUpdateEvent
{
	public static readonly FLOOD_CONTROL: string = 'RWFCE_FLOOD_CONTROL';

	private _seconds: number;

	// AS3: sources/win63_version/habbo/ui/widget/events/RoomWidgetFloodControlEvent.as::RoomWidgetFloodControlEvent()
	constructor(seconds: number)
	{
		super('RWFCE_FLOOD_CONTROL');

		this._seconds = seconds;
	}

	public get seconds(): number
	{
		return this._seconds;
	}
}

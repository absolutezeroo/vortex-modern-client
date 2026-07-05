/**
 * RoomWidgetRoomViewUpdateEvent
 *
 * @see sources/win63_2023_version/com/sulake/habbo/ui/widget/events/RoomWidgetRoomViewUpdateEvent.as
 */
import {RoomWidgetUpdateEvent} from './RoomWidgetUpdateEvent';

export class RoomWidgetRoomViewUpdateEvent extends RoomWidgetUpdateEvent
{
	public static readonly ROOM_VIEW_SIZE_CHANGED: string = 'RWRVUE_ROOM_VIEW_SIZE_CHANGED';
	public static readonly ROOM_VIEW_SCALE_CHANGED: string = 'RWRVUE_ROOM_VIEW_SCALE_CHANGED';
	public static readonly ROOM_VIEW_POSITION_CHANGED: string = 'RWRVUE_ROOM_VIEW_POSITION_CHANGED';

	private _rect: {x: number; y: number; width: number; height: number} | null;
	private _positionDelta: {x: number; y: number} | null;
	private _scale: number;

	// AS3: sources/win63_2023_version/com/sulake/habbo/ui/widget/events/RoomWidgetRoomViewUpdateEvent.as::RoomWidgetRoomViewUpdateEvent()
	constructor(
		type: string,
		rect: {x: number; y: number; width: number; height: number} | null = null,
		positionDelta: {x: number; y: number} | null = null,
		scale: number = 0
	)
	{
		super(type);

		this._rect = rect;
		this._positionDelta = positionDelta;
		this._scale = scale;
	}

	public get rect(): {x: number; y: number; width: number; height: number} | null
	{
		return this._rect ? {...this._rect} : null;
	}

	public get positionDelta(): {x: number; y: number} | null
	{
		return this._positionDelta ? {...this._positionDelta} : null;
	}

	public get scale(): number
	{
		return this._scale;
	}
}

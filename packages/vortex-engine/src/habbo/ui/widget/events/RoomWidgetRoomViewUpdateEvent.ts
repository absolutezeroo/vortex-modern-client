/**
 * RoomWidgetRoomViewUpdateEvent
 *
 * @see sources/win63_2023_version/com/sulake/habbo/ui/widget/events/RoomWidgetRoomViewUpdateEvent.as
 */
import {RoomWidgetUpdateEvent} from './RoomWidgetUpdateEvent';

export class RoomWidgetRoomViewUpdateEvent extends RoomWidgetUpdateEvent
{
    // AS3: .../src/com/sulake/habbo/ui/widget/events/RoomWidgetRoomViewUpdateEvent.as::ROOM_VIEW_SIZE_CHANGED
    public static readonly ROOM_VIEW_SIZE_CHANGED: string = 'RWRVUE_ROOM_VIEW_SIZE_CHANGED';
    // AS3: .../src/com/sulake/habbo/ui/widget/events/RoomWidgetRoomViewUpdateEvent.as::ROOM_VIEW_SCALE_CHANGED
    public static readonly ROOM_VIEW_SCALE_CHANGED: string = 'RWRVUE_ROOM_VIEW_SCALE_CHANGED';
    // AS3: .../src/com/sulake/habbo/ui/widget/events/RoomWidgetRoomViewUpdateEvent.as::ROOM_VIEW_POSITION_CHANGED
    public static readonly ROOM_VIEW_POSITION_CHANGED: string = 'RWRVUE_ROOM_VIEW_POSITION_CHANGED';

    private _rect: {x: number; y: number; width: number; height: number} | null;
    private _positionDelta: {x: number; y: number} | null;
    private _scale: number;

    // AS3: .../src/com/sulake/habbo/ui/widget/events/RoomWidgetRoomViewUpdateEvent.as::RoomWidgetRoomViewUpdateEvent()
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

    // AS3: .../src/com/sulake/habbo/ui/widget/events/RoomWidgetRoomViewUpdateEvent.as::get rect()
    public get rect(): {x: number; y: number; width: number; height: number} | null
    {
        return this._rect ? {...this._rect} : null;
    }

    // AS3: .../src/com/sulake/habbo/ui/widget/events/RoomWidgetRoomViewUpdateEvent.as::get positionDelta()
    public get positionDelta(): {x: number; y: number} | null
    {
        return this._positionDelta ? {...this._positionDelta} : null;
    }

    // AS3: .../src/com/sulake/habbo/ui/widget/events/RoomWidgetRoomViewUpdateEvent.as::get scale()
    public get scale(): number
    {
        return this._scale;
    }
}

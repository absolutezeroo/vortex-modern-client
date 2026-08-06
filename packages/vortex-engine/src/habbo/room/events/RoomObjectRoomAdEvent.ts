/**
 * RoomObjectRoomAdEvent
 *
 * Based on AS3: com.sulake.habbo.room.events.RoomObjectRoomAdEvent
 *
 * Event dispatched for room advertisement interactions.
 */
import {RoomObjectEvent} from '@room/events/RoomObjectEvent';
import type {IRoomObject} from '@room/object/IRoomObject';

export class RoomObjectRoomAdEvent extends RoomObjectEvent
{
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/room/events/RoomObjectRoomAdEvent.as::RORAE_ROOM_AD_TOOLTIP_SHOW
    public static readonly RORAE_ROOM_AD_TOOLTIP_SHOW = 'RORAE_ROOM_AD_TOOLTIP_SHOW';
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/room/events/RoomObjectRoomAdEvent.as::RORAE_ROOM_AD_TOOLTIP_HIDE
    public static readonly RORAE_ROOM_AD_TOOLTIP_HIDE = 'RORAE_ROOM_AD_TOOLTIP_HIDE';
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/room/events/RoomObjectRoomAdEvent.as::RORAE_ROOM_AD_FURNI_CLICK
    public static readonly RORAE_ROOM_AD_FURNI_CLICK = 'RORAE_ROOM_AD_FURNI_CLICK';
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/room/events/RoomObjectRoomAdEvent.as::RORAE_ROOM_AD_FURNI_DOUBLE_CLICK
    public static readonly RORAE_ROOM_AD_FURNI_DOUBLE_CLICK = 'RORAE_ROOM_AD_FURNI_DOUBLE_CLICK';

    constructor(type: string, object: IRoomObject | null, imageUrl: string | null = null, clickUrl: string | null = null)
    {
        super(type, object);
        this._imageUrl = imageUrl;
        this._clickUrl = clickUrl;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/room/events/RoomObjectRoomAdEvent.as::_imageUrl
    private _imageUrl: string | null;

    // AS3: .../src/com/sulake/habbo/room/events/RoomObjectRoomAdEvent.as::get imageUrl()
    get imageUrl(): string | null
    {
        return this._imageUrl;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/room/events/RoomObjectRoomAdEvent.as::_clickUrl
    private _clickUrl: string | null;

    // AS3: .../src/com/sulake/habbo/room/events/RoomObjectRoomAdEvent.as::get clickUrl()
    get clickUrl(): string | null
    {
        return this._clickUrl;
    }
}

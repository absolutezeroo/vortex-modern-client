/**
 * FurnitureBackgroundColorWidgetHandler
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/FurnitureBackgroundColorWidgetHandler.as
 *
 * **Event-driven, not message-driven.** Where the other furni handlers claim a
 * `RWFWM_MESSAGE_REQUEST_*` through `getWidgetMessages()`, this one subscribes to the raw
 * `RETWE_REQUEST_BACKGROUND_COLOR` engine event through `getProcessedEvents()` and opens the widget
 * directly. That is AS3's design, not a shortcut taken here.
 *
 * The decompiled source returns `null` from `getWidgetMessages()`; an empty array is returned
 * instead, as with the other handlers whose callers iterate the result.
 */
import type {IRoomWidgetHandler} from '@habbo/ui/IRoomWidgetHandler';
import type {IRoomWidgetHandlerContainer} from '@habbo/ui/IRoomWidgetHandlerContainer';
import type {RoomEngineObjectEvent} from '@habbo/room/events/RoomEngineObjectEvent';
import {RoomEngineToWidgetEvent} from '@habbo/room/events/RoomEngineToWidgetEvent';
import {RoomObjectVariableEnum} from '@habbo/room/object/RoomObjectVariableEnum';
import type {BackgroundColorFurniWidget} from '@habbo/ui/widget/furniture/backgroundcolor/BackgroundColorFurniWidget';

export class FurnitureBackgroundColorWidgetHandler implements IRoomWidgetHandler
{
    // AS3: FurnitureBackgroundColorWidgetHandler.as::_SafeStr_5769
    private _disposed: boolean = false;

    // AS3: FurnitureBackgroundColorWidgetHandler.as::_SafeStr_4549
    private _widget: BackgroundColorFurniWidget | null = null;

    // AS3: FurnitureBackgroundColorWidgetHandler.as::_container
    private _container: IRoomWidgetHandlerContainer | null = null;

    // AS3: FurnitureBackgroundColorWidgetHandler.as::get type()
    public get type(): string
    {
        return 'RWE_ROOM_BACKGROUND_COLOR';
    }

    // AS3: FurnitureBackgroundColorWidgetHandler.as::set widget()
    public set widget(value: BackgroundColorFurniWidget | null)
    {
        this._widget = value;
    }

    // AS3: FurnitureBackgroundColorWidgetHandler.as::get container()
    public get container(): IRoomWidgetHandlerContainer | null
    {
        return this._container;
    }

    // AS3: FurnitureBackgroundColorWidgetHandler.as::set container()
    public set container(value: IRoomWidgetHandlerContainer | null)
    {
        this._container = value;
    }

    // AS3: FurnitureBackgroundColorWidgetHandler.as::getWidgetMessages()
    public getWidgetMessages(): string[]
    {
        return [];
    }

    // AS3: FurnitureBackgroundColorWidgetHandler.as::processWidgetMessage()
    public processWidgetMessage(_message: unknown): unknown
    {
        return null;
    }

    // AS3: FurnitureBackgroundColorWidgetHandler.as::getProcessedEvents()
    public getProcessedEvents(): string[]
    {
        return [RoomEngineToWidgetEvent.REQUEST_BACKGROUND_COLOR];
    }

    // AS3: FurnitureBackgroundColorWidgetHandler.as::processEvent()
    public processEvent(event: unknown): void
    {
        const engineEvent = event as RoomEngineObjectEvent;

        if(engineEvent?.type !== RoomEngineToWidgetEvent.REQUEST_BACKGROUND_COLOR) return;

        if(!this.validateRights()) return;

        const roomObject = this._container?.roomEngine?.getRoomObject(
            engineEvent.roomId, engineEvent.objectId, engineEvent.category
        ) ?? null;

        if(roomObject === null) return;

        const model = roomObject.getModel();

        if(model === null) return;

        this._widget?.open(
            roomObject.getId(),
            model.getNumber(RoomObjectVariableEnum.FURNITURE_ROOM_BACKGROUND_COLOR_HUE),
            model.getNumber(RoomObjectVariableEnum.FURNITURE_ROOM_BACKGROUND_COLOR_SATURATION),
            model.getNumber(RoomObjectVariableEnum.FURNITURE_ROOM_BACKGROUND_COLOR_LIGHTNESS)
        );
    }

    /**
     * Owner, any-room controller, or room-controller level >= 1. Evaluated before the room object
     * is even looked up, so a visitor never opens the editor.
     */
    // AS3: FurnitureBackgroundColorWidgetHandler.as::validateRights()
    private validateRights(): boolean
    {
        const isOwner = this._container?.roomSession?.isRoomOwner ?? false;
        const hasControllerLevel = (this._container?.roomSession?.roomControllerLevel ?? 0) >= 1;
        const isAnyRoomController = this._container?.sessionDataManager?.isAnyRoomController ?? false;

        return isOwner || isAnyRoomController || hasControllerLevel;
    }

    // AS3: FurnitureBackgroundColorWidgetHandler.as::update()
    public update(): void
    {
        // AS3 no-op.
    }

    // AS3: FurnitureBackgroundColorWidgetHandler.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: FurnitureBackgroundColorWidgetHandler.as::dispose()
    public dispose(): void
    {
        if(!this._disposed)
        {
            this.container = null;
            this._disposed = true;
        }
    }
}

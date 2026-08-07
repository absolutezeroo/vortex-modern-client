import type {IRoomWidgetHandler} from '../IRoomWidgetHandler';
import type {IRoomWidgetHandlerContainer} from '../IRoomWidgetHandlerContainer';
import type {RoomWidgetMessage} from '../widget/messages/RoomWidgetMessage';
import type {RoomWidgetUpdateEvent} from '../widget/events/RoomWidgetUpdateEvent';
import type {AreaHideFurniWidget} from '../widget/furniture/areahide/AreaHideFurniWidget';
import {RoomEngineToWidgetEvent} from '@habbo/room/events/RoomEngineToWidgetEvent';
import {RoomEngineAreaHideStateWidgetEvent} from '@habbo/room/events/RoomEngineAreaHideStateWidgetEvent';
import {RoomObjectVariableEnum} from '@habbo/room/object/RoomObjectVariableEnum';

/**
 * Opens the area-hide configuration window, and relays the server's on/off confirmations to it.
 *
 * Unlike the message-driven handlers this one holds a direct reference to its widget and calls
 * into it — the widget hands itself over in its own constructor. Nothing here goes through the
 * widget event bus.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/FurnitureAreaHideWidgetHandler.as
 */
export class FurnitureAreaHideWidgetHandler implements IRoomWidgetHandler
{
    // AS3: .../handler/FurnitureAreaHideWidgetHandler.as::CONTROLLER_LEVEL_RIGHTS
    // Name DERIVED: AS3 compares `roomControllerLevel >= 1` inline.
    private static readonly CONTROLLER_LEVEL_RIGHTS: number = 1;

    // AS3: .../handler/FurnitureAreaHideWidgetHandler.as::_disposed
    private _disposed: boolean = false;

    // AS3: .../handler/FurnitureAreaHideWidgetHandler.as::_widget
    private _widget: AreaHideFurniWidget | null = null;

    // AS3: .../handler/FurnitureAreaHideWidgetHandler.as::_container
    private _container: IRoomWidgetHandlerContainer | null = null;

    // AS3: .../handler/FurnitureAreaHideWidgetHandler.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: .../handler/FurnitureAreaHideWidgetHandler.as::get type()
    get type(): string
    {
        return 'RWE_AREA_HIDE';
    }

    // AS3: .../handler/FurnitureAreaHideWidgetHandler.as::set widget()
    set widget(value: AreaHideFurniWidget | null)
    {
        this._widget = value;
    }

    // AS3: .../handler/FurnitureAreaHideWidgetHandler.as::get container()
    // This handler has a getter as well as a setter — the widget reads `handler.container` to
    // reach the connection, since it sends its own two composers rather than raising messages.
    get container(): IRoomWidgetHandlerContainer | null
    {
        return this._container;
    }

    // AS3: .../handler/FurnitureAreaHideWidgetHandler.as::set container()
    set container(value: IRoomWidgetHandlerContainer | null)
    {
        this._container = value;
    }

    // AS3: .../handler/FurnitureAreaHideWidgetHandler.as::getWidgetMessages()
    // Null, not [] — the window talks to the server directly.
    getWidgetMessages(): string[] | null
    {
        return null;
    }

    // AS3: .../handler/FurnitureAreaHideWidgetHandler.as::processWidgetMessage()
    processWidgetMessage(_message: RoomWidgetMessage): RoomWidgetUpdateEvent | null
    {
        return null;
    }

    // AS3: .../handler/FurnitureAreaHideWidgetHandler.as::getProcessedEvents()
    getProcessedEvents(): string[]
    {
        return [
            RoomEngineToWidgetEvent.REQUEST_AREA_HIDE,
            RoomEngineAreaHideStateWidgetEvent.UPDATE_STATE_AREA_HIDE
        ];
    }

    /**
     * The open request reads the whole configuration off the room object's model — the rectangle
     * as four numbers and the three flags as `== 1` comparisons, because the model stores them as
     * numbers. The state confirmation carries only the id and the flag.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/FurnitureAreaHideWidgetHandler.as::processEvent()
    processEvent(event: RoomEngineToWidgetEvent): void
    {
        if(this._widget === null) return;

        switch(event.type)
        {
            case RoomEngineToWidgetEvent.REQUEST_AREA_HIDE:
            {
                if(!this.validateRights()) return;

                const object = this._container?.roomEngine?.getRoomObject(event.roomId, event.objectId, event.category) ?? null;

                // AS3 does not null-check the object here and would throw; the guard is this
                // port's, and it is the only difference in this method.
                if(object === null) return;

                const model = object.getModel();

                this._widget.open(
                    object.getId(),
                    Boolean(object.getState(0)),
                    model.getNumber(RoomObjectVariableEnum.FURNITURE_AREA_HIDE_ROOT_X),
                    model.getNumber(RoomObjectVariableEnum.FURNITURE_AREA_HIDE_ROOT_Y),
                    model.getNumber(RoomObjectVariableEnum.FURNITURE_AREA_HIDE_WIDTH),
                    model.getNumber(RoomObjectVariableEnum.FURNITURE_AREA_HIDE_LENGTH),
                    model.getNumber(RoomObjectVariableEnum.FURNITURE_AREA_HIDE_INVISIBILITY) === 1,
                    model.getNumber(RoomObjectVariableEnum.FURNITURE_AREA_HIDE_WALL_ITEMS) === 1,
                    model.getNumber(RoomObjectVariableEnum.FURNITURE_AREA_HIDE_INVERT) === 1
                );

                break;
            }

            case RoomEngineAreaHideStateWidgetEvent.UPDATE_STATE_AREA_HIDE:
            {
                const stateEvent = event as RoomEngineAreaHideStateWidgetEvent;

                this._widget.updateStatus(stateEvent.objectId, stateEvent.isOn);

                break;
            }
        }
    }

    // AS3: .../handler/FurnitureAreaHideWidgetHandler.as::validateRights()
    // Any of the three grants it: room owner, room-controller rights here, or global controller.
    private validateRights(): boolean
    {
        const session = this._container?.roomSession ?? null;

        const isOwner = session?.isRoomOwner ?? false;
        const hasControllerLevel = (session?.roomControllerLevel ?? 0) >= FurnitureAreaHideWidgetHandler.CONTROLLER_LEVEL_RIGHTS;
        const isAnyRoomController = this._container?.sessionDataManager?.isAnyRoomController ?? false;

        return isOwner || isAnyRoomController || hasControllerLevel;
    }

    // AS3: .../handler/FurnitureAreaHideWidgetHandler.as::update()
    // Empty in AS3 too.
    update(): void
    {
    }

    // AS3: .../handler/FurnitureAreaHideWidgetHandler.as::dispose()
    // Guarded against a second call, and clears through the setter as AS3 does.
    dispose(): void
    {
        if(this._disposed) return;

        this.container = null;
        this._disposed = true;
    }
}

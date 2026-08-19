import type {IRoomWidgetHandler} from '@habbo/ui/IRoomWidgetHandler';
import type {IRoomWidgetHandlerContainer} from '@habbo/ui/IRoomWidgetHandlerContainer';
import type {IRoomObject} from '@room/object/IRoomObject';
import {RoomEngineToWidgetEvent} from '@habbo/room/events/RoomEngineToWidgetEvent';
import {RoomObjectCategoryEnum} from '@habbo/room/object/RoomObjectCategoryEnum';
import {RoomObjectVariableEnum} from '@habbo/room/object/RoomObjectVariableEnum';
import type {CustomStackHeightWidget} from '@habbo/ui/widget/furniture/CustomStackHeightWidget';

/**
 * CustomStackHeightWidgetHandler
 *
 * Opens the stacking-height slider on `RETWE_OPEN_WIDGET` and, unusually, keeps polling the
 * furni afterwards: `update()` runs every frame and pushes the object's *actual* z back into
 * the widget whenever the server has moved it, so the slider follows a height somebody else
 * changed.
 *
 * The class name is **derived**, not recovered: the handler is `_SafeCls_3852` in every tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/_SafeCls_3852.as
 */
export class CustomStackHeightWidgetHandler implements IRoomWidgetHandler
{
    // AS3: .../handler/_SafeCls_3852.as::_container
    private _container: IRoomWidgetHandlerContainer | null = null;

    // AS3: .../handler/_SafeCls_3852.as::_SafeStr_4549
    private _widget: CustomStackHeightWidget | null = null;

    // AS3: .../handler/_SafeCls_3852.as::_SafeStr_7264
    private _roomId: number = -1;

    // AS3: .../handler/_SafeCls_3852.as::_SafeStr_6346
    private _objectId: number = -1;

    /** The last height pushed into the widget, so an unchanged frame does nothing. */
    // AS3: .../handler/_SafeCls_3852.as::_SafeStr_6440
    private _lastHeight: number = NaN;

    // AS3: .../handler/_SafeCls_3852.as::set widget()
    public set widget(value: CustomStackHeightWidget | null)
    {
        this._widget = value;
    }

    // AS3: .../handler/_SafeCls_3852.as::get type()
    public get type(): string
    {
        return 'RWE_CUSTOM_STACK_HEIGHT';
    }

    /** Registering for the frame tick is done by the setter itself, as AS3 does. */
    // AS3: .../handler/_SafeCls_3852.as::set container()
    public set container(value: IRoomWidgetHandlerContainer | null)
    {
        this._container?.removeUpdateListener(this);

        this._container = value;

        this._container?.addUpdateListener(this);
    }

    // AS3: .../handler/_SafeCls_3852.as::get container()
    public get container(): IRoomWidgetHandlerContainer | null
    {
        return this._container;
    }

    // AS3: .../handler/_SafeCls_3852.as::getWidgetMessages()
    public getWidgetMessages(): string[]
    {
        return [];
    }

    // AS3: .../handler/_SafeCls_3852.as::processWidgetMessage()
    public processWidgetMessage(_message: unknown): unknown
    {
        return null;
    }

    /**
     * Empty in AS3 too: this handler is reached through `RETWE_OPEN_WIDGET`/`RETWE_CLOSE_WIDGET`,
     * which `RoomDesktop` routes to every handler regardless of what it declares here.
     */
    // AS3: .../handler/_SafeCls_3852.as::getProcessedEvents()
    public getProcessedEvents(): string[]
    {
        return [];
    }

    // AS3: .../handler/_SafeCls_3852.as::processEvent()
    public processEvent(event: unknown): void
    {
        const engineEvent = event as {type?: string; roomId: number; objectId: number; category: number} | null;

        if(engineEvent === null || this._container?.roomEngine === null || this._container === null) return;

        switch(engineEvent.type)
        {
            case RoomEngineToWidgetEvent.REQUEST_OPEN_WIDGET:
            {
                this._roomId = engineEvent.roomId;
                this._objectId = engineEvent.objectId;

                const roomObject = this._container.roomEngine?.getRoomObject(
                    engineEvent.roomId, engineEvent.objectId, engineEvent.category
                ) ?? null;

                if(roomObject === null || !this.validateRights(roomObject) || this._widget === null) return;

                const typeId = roomObject.getModel()?.getNumber(RoomObjectVariableEnum.FURNITURE_TYPE_ID) ?? 0;
                const itemData = this._container.sessionDataManager?.getFloorItemData(typeId) ?? null;

                // Magic walk tiles get the extra multi-walk checkbox; everything else is a
                // plain height slider.
                const isWalkTile = (itemData?.className ?? '').indexOf('tile_walkmagic') === 0;
                const multiWalkMode = roomObject.getModel()?.getNumber(RoomObjectVariableEnum.FURNITURE_EXTRA) === 1;

                this._widget.open(this._objectId, CustomStackHeightWidgetHandler.getCurrentStackHeight(roomObject), isWalkTile, multiWalkMode);

                this._lastHeight = CustomStackHeightWidgetHandler.getCurrentStackHeight(roomObject);
                break;
            }
            case RoomEngineToWidgetEvent.REQUEST_CLOSE_WIDGET:
                if(this._widget !== null && this._objectId === engineEvent.objectId)
                {
                    this._widget.hide();
                    this.resetTrackedFurni();
                }
                break;
        }
    }

    /** Frame tick: mirror the furni's real height into the widget when it changes. */
    // AS3: .../handler/_SafeCls_3852.as::update()
    public update(): void
    {
        if(this._container?.roomEngine === null || this._widget === null) return;
        if(this._widget.mainWindow === null || !this._widget.mainWindow.visible) return;
        if(this._roomId < 0 || this._objectId < 0) return;

        const roomObject = this._container?.roomEngine?.getRoomObject(
            this._roomId, this._objectId, RoomObjectCategoryEnum.OBJECT_CATEGORY_FURNITURE
        ) ?? null;

        if(roomObject === null || !this.validateRights(roomObject)) return;

        const height = CustomStackHeightWidgetHandler.getCurrentStackHeight(roomObject);

        if(isNaN(this._lastHeight) || this._lastHeight !== height)
        {
            this._lastHeight = height;

            this._widget.updateHeight(roomObject.getId(), height);
        }
    }

    // AS3: .../handler/_SafeCls_3852.as::getCurrentStackHeight()
    private static getCurrentStackHeight(roomObject: IRoomObject | null): number
    {
        const z = roomObject?.getLocation()?.z ?? NaN;

        return isNaN(z) ? 0 : z;
    }

    /**
     * Wider than the other furni handlers': owning the *furni* is enough here, even without
     * rights over the room.
     */
    // AS3: .../handler/_SafeCls_3852.as::validateRights()
    private validateRights(roomObject: IRoomObject | null = null): boolean
    {
        const isOwner = this._container?.roomSession?.isRoomOwner ?? false;
        const hasControllerLevel = (this._container?.roomSession?.roomControllerLevel ?? 0) >= 1;
        const isAnyRoomController = this._container?.sessionDataManager?.isAnyRoomController ?? false;
        const ownsFurniture = roomObject !== null && (this._container?.isOwnerOfFurniture(roomObject) ?? false);

        return isOwner || isAnyRoomController || hasControllerLevel || ownsFurniture;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/_SafeCls_3852.as::resetTrackedFurni()
    private resetTrackedFurni(): void
    {
        this._roomId = -1;
        this._objectId = -1;
        this._lastHeight = NaN;
    }

    // AS3: .../handler/_SafeCls_3852.as::get disposed()
    public get disposed(): boolean
    {
        return this._container === null;
    }

    // AS3: .../handler/_SafeCls_3852.as::dispose()
    public dispose(): void
    {
        this._container?.removeUpdateListener(this);

        this.resetTrackedFurni();

        this._container = null;
        this._widget = null;
    }
}

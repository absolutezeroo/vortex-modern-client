/**
 * FurnitureEcotronBoxWidgetHandler
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/FurnitureEcotronBoxWidgetHandler.as
 *
 * The only furni handler so far that is **both** message-driven and event-driven, and that is also
 * an image listener. Opening a box is a three-hop sequence:
 *
 *   1. `RWFWM_MESSAGE_REQUEST_ECOTRONBOX` — read the box's date and class name off the room object.
 *   2. `RWEBOM_OPEN_ECOTRONBOX` — the user pressed Open; forward it as a present-open.
 *   3. `RSPE_PRESENT_OPENED` — the server says what was inside. The icon is requested from the room
 *      engine, which may answer synchronously or later through `imageReady()`; both paths dispatch
 *      the same `RWEBDUE_CONTENTS`.
 */
import type {IRoomWidgetHandler} from '@habbo/ui/IRoomWidgetHandler';
import type {IRoomWidgetHandlerContainer} from '@habbo/ui/IRoomWidgetHandlerContainer';
import type {IGetImageListener} from '@habbo/room/IGetImageListener';
import type {RoomSessionPresentEvent} from '@habbo/session/events/RoomSessionPresentEvent';
import type {IFurnitureData} from '@habbo/session/furniture/IFurnitureData';
import {RoomWidgetEcotronBoxDataUpdateEvent} from '@habbo/ui/widget/events/RoomWidgetEcotronBoxDataUpdateEvent';
import {RoomWidgetEcotronBoxOpenMessage} from '@habbo/ui/widget/messages/RoomWidgetEcotronBoxOpenMessage';
import {RoomWidgetFurniToWidgetMessage} from '@habbo/ui/widget/messages/RoomWidgetFurniToWidgetMessage';

// AS3: FurnitureEcotronBoxWidgetHandler.as::processEvent() — the session event it subscribes to.
const PRESENT_OPENED: string = 'RSPE_PRESENT_OPENED';

export class FurnitureEcotronBoxWidgetHandler implements IRoomWidgetHandler, IGetImageListener
{
    // AS3: FurnitureEcotronBoxWidgetHandler.as::_SafeStr_5769
    private _disposed: boolean = false;

    // AS3: FurnitureEcotronBoxWidgetHandler.as::_container
    private _container: IRoomWidgetHandlerContainer | null = null;

    /**
     * The box currently on screen. `RWEBOM_OPEN_ECOTRONBOX` is refused for any other id, so a stale
     * card cannot open the wrong box.
     */
    // AS3: FurnitureEcotronBoxWidgetHandler.as::_SafeStr_4841
    private _objectId: number = -1;

    /**
     * Held between `processEvent()` and `imageReady()` — the asynchronous icon callback carries no
     * name of its own.
     */
    // AS3: FurnitureEcotronBoxWidgetHandler.as::_name
    private _name: string = '';

    // AS3: FurnitureEcotronBoxWidgetHandler.as::get type()
    public get type(): string
    {
        return 'RWE_FURNI_ECOTRONBOX_WIDGET';
    }

    // AS3: FurnitureEcotronBoxWidgetHandler.as::set container()
    public set container(value: IRoomWidgetHandlerContainer | null)
    {
        this._container = value;
    }

    /**
     * AS3 also lists `RWEBOM_ECOTRONBOX_OPENED`, which its own switch has no case for and no class
     * ever sends. Registered here too, so the handler claims exactly what AS3 claims.
     */
    // AS3: FurnitureEcotronBoxWidgetHandler.as::getWidgetMessages()
    public getWidgetMessages(): string[]
    {
        return [
            RoomWidgetFurniToWidgetMessage.WIDGET_MESSAGE_REQUEST_ECOTRONBOX_WIDGET,
            RoomWidgetEcotronBoxOpenMessage.OPEN_ECOTRONBOX,
            'RWEBOM_ECOTRONBOX_OPENED'
        ];
    }

    // AS3: FurnitureEcotronBoxWidgetHandler.as::processWidgetMessage()
    public processWidgetMessage(message: unknown): unknown
    {
        if(this.disposed || message === null || message === undefined) return null;

        const widgetMessage = message as RoomWidgetFurniToWidgetMessage;

        switch(widgetMessage.type)
        {
            case RoomWidgetFurniToWidgetMessage.WIDGET_MESSAGE_REQUEST_ECOTRONBOX_WIDGET:
                this.openCard(widgetMessage);
                break;
            case RoomWidgetEcotronBoxOpenMessage.OPEN_ECOTRONBOX: {
                const open = message as RoomWidgetEcotronBoxOpenMessage;

                if(open.objectId !== this._objectId) return null;

                this._container?.roomSession?.sendPresentOpenMessage(open.objectId);
                break;
            }
        }

        return null;
    }

    /**
     * The card's layout is picked from the furni's class name, which comes from the furnidata rather
     * than the room object — an unknown type id yields an empty string, which the widget maps to the
     * default card.
     */
    // AS3: FurnitureEcotronBoxWidgetHandler.as::processWidgetMessage() "RWFWM_MESSAGE_REQUEST_ECOTRONBOX"
    private openCard(message: RoomWidgetFurniToWidgetMessage): void
    {
        const roomObject = this._container?.roomEngine?.getRoomObject(
            message.roomId, message.id, message.category
        ) ?? null;

        if(roomObject === null) return;

        const model = roomObject.getModel();

        if(model === null) return;

        this._objectId = message.id;

        const text = model.getString('furniture_data');

        if(text === null) return;

        const typeId = model.getNumber('furniture_type_id');
        const itemData = this._container?.sessionDataManager?.getFloorItemData(typeId) ?? null;
        const className = itemData !== null ? itemData.className : '';

        const controller = (this._container?.roomSession?.isRoomOwner ?? false)
            || (this._container?.sessionDataManager?.isAnyRoomController ?? false);

        this._container?.desktopEvents.emit(
            RoomWidgetEcotronBoxDataUpdateEvent.UPDATE_PACKAGEINFO,
            new RoomWidgetEcotronBoxDataUpdateEvent(
                RoomWidgetEcotronBoxDataUpdateEvent.UPDATE_PACKAGEINFO, message.id, text, className, controller
            )
        );
    }

    /**
     * The asynchronous half of the icon request. Dispatches objectId 0, as AS3 does — the widget
     * matches the contents to its open card through its own `_opened` flag, not through this id.
     */
    // AS3: FurnitureEcotronBoxWidgetHandler.as::imageReady()
    public imageReady(_id: number, data: ImageBitmap | null): void
    {
        if(this.disposed) return;

        this._container?.desktopEvents.emit(
            RoomWidgetEcotronBoxDataUpdateEvent.UPDATE_CONTENTS,
            new RoomWidgetEcotronBoxDataUpdateEvent(
                RoomWidgetEcotronBoxDataUpdateEvent.UPDATE_CONTENTS, 0, this._name, '', false, data
            )
        );
    }

    // AS3: FurnitureEcotronBoxWidgetHandler.as::imageFailed()
    public imageFailed(_id: number): void
    {
        // AS3 no-op — a missing icon leaves the card showing its date.
    }

    // AS3: FurnitureEcotronBoxWidgetHandler.as::getProcessedEvents()
    public getProcessedEvents(): string[]
    {
        return [PRESENT_OPENED];
    }

    /**
     * `itemType` selects which catalogue the class id belongs to: "s" is a floor item, "i" a wall
     * item. The icon request may return a result immediately — AS3 dispatches then and there, and
     * `imageReady()` covers the case where it does not.
     */
    // AS3: FurnitureEcotronBoxWidgetHandler.as::processEvent()
    public processEvent(event: unknown): void
    {
        const presentEvent = event as RoomSessionPresentEvent | null;

        if(presentEvent === null || presentEvent.type !== PRESENT_OPENED) return;

        this._name = '';

        let icon = null;
        let itemData: IFurnitureData | null = null;

        if(presentEvent.itemType === 's')
        {
            icon = this._container?.roomEngine?.getFurnitureIcon(presentEvent.classId, this) ?? null;
            itemData = this._container?.sessionDataManager?.getFloorItemData(presentEvent.classId) ?? null;
        }
        else if(presentEvent.itemType === 'i')
        {
            icon = this._container?.roomEngine?.getWallItemIcon(presentEvent.classId, this) ?? null;
            itemData = this._container?.sessionDataManager?.getWallItemData(presentEvent.classId) ?? null;
        }

        if(itemData !== null)
        {
            this._name = itemData.localizedName;
        }

        if(icon !== null)
        {
            this._container?.desktopEvents.emit(
                RoomWidgetEcotronBoxDataUpdateEvent.UPDATE_CONTENTS,
                new RoomWidgetEcotronBoxDataUpdateEvent(
                    RoomWidgetEcotronBoxDataUpdateEvent.UPDATE_CONTENTS, 0, this._name, '', false, icon.data
                )
            );
        }
    }

    // AS3: FurnitureEcotronBoxWidgetHandler.as::update()
    public update(): void
    {
        // AS3 no-op.
    }

    // AS3: FurnitureEcotronBoxWidgetHandler.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: FurnitureEcotronBoxWidgetHandler.as::dispose()
    public dispose(): void
    {
        this._disposed = true;
        this._container = null;
    }
}

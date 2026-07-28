/**
 * FurnitureStickieWidgetHandler
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/FurnitureStickieWidgetHandler.as
 *
 * Three messages: the open request reads the note out of the room object's model, and the two
 * write requests go back out through the room engine.
 */
import type {IRoomWidgetHandler} from '@habbo/ui/IRoomWidgetHandler';
import type {IRoomWidgetHandlerContainer} from '@habbo/ui/IRoomWidgetHandlerContainer';
import {RoomObjectCategoryEnum} from '@habbo/room/object/RoomObjectCategoryEnum';
import {RoomWidgetStickieDataUpdateEvent} from '@habbo/ui/widget/events/RoomWidgetStickieDataUpdateEvent';
import {RoomWidgetFurniToWidgetMessage} from '@habbo/ui/widget/messages/RoomWidgetFurniToWidgetMessage';
import {RoomWidgetStickieSendUpdateMessage} from '@habbo/ui/widget/messages/RoomWidgetStickieSendUpdateMessage';

/**
 * AS3: FurnitureStickieWidgetHandler.as::processWidgetMessage()
 *
 * AS3 passes the literal 20 to both engine calls. It is the wall-item category, and the engine
 * gates on exactly that value.
 */
const STICKIE_CATEGORY: number = RoomObjectCategoryEnum.OBJECT_CATEGORY_WALL;

export class FurnitureStickieWidgetHandler implements IRoomWidgetHandler
{
    // AS3: FurnitureStickieWidgetHandler.as::_SafeStr_5769
    private _disposed: boolean = false;

    // AS3: FurnitureStickieWidgetHandler.as::_container
    private _container: IRoomWidgetHandlerContainer | null = null;

    // AS3: FurnitureStickieWidgetHandler.as::get type()
    public get type(): string
    {
        return 'RWE_FURNI_STICKIE_WIDGET';
    }

    // AS3: FurnitureStickieWidgetHandler.as::set container()
    public set container(value: IRoomWidgetHandlerContainer | null)
    {
        this._container = value;
    }

    // AS3: FurnitureStickieWidgetHandler.as::getWidgetMessages()
    public getWidgetMessages(): string[]
    {
        return [
            RoomWidgetFurniToWidgetMessage.WIDGET_MESSAGE_REQUEST_STICKIE_WIDGET,
            RoomWidgetStickieSendUpdateMessage.STICKIE_SEND_DELETE,
            RoomWidgetStickieSendUpdateMessage.STICKIE_SEND_UPDATE
        ];
    }

    // AS3: FurnitureStickieWidgetHandler.as::processWidgetMessage()
    public processWidgetMessage(message: unknown): unknown
    {
        if(this.disposed || message === null || message === undefined) return null;

        const widgetMessage = message as RoomWidgetFurniToWidgetMessage;

        switch(widgetMessage.type)
        {
            case RoomWidgetFurniToWidgetMessage.WIDGET_MESSAGE_REQUEST_STICKIE_WIDGET:
                this.openStickie(widgetMessage);
                break;
            case RoomWidgetStickieSendUpdateMessage.STICKIE_SEND_UPDATE: {
                const update = message as RoomWidgetStickieSendUpdateMessage;

                this._container?.roomEngine?.modifyRoomObjectData(
                    update.objectId, STICKIE_CATEGORY, update.colorHex, update.text
                );
                break;
            }
            case RoomWidgetStickieSendUpdateMessage.STICKIE_SEND_DELETE: {
                const remove = message as RoomWidgetStickieSendUpdateMessage;

                this._container?.roomEngine?.deleteRoomObject(remove.objectId, STICKIE_CATEGORY);
                break;
            }
        }

        return null;
    }

    /**
     * AS3: FurnitureStickieWidgetHandler.as::processWidgetMessage() "RWFWM_MESSAGE_REQUEST_STICKIE"
     *
     * `furniture_itemdata` is `"<colourHex> <text>"`. AS3 splits on the *first* space only, so a
     * note whose text contains spaces survives intact, and a note with no space at all is treated
     * as colour-only with empty text. The length < 6 guard rejects anything too short to hold a
     * six-digit colour.
     */
    private openStickie(message: RoomWidgetFurniToWidgetMessage): void
    {
        const roomObject = this._container?.roomEngine?.getRoomObject(
            message.roomId, message.id, message.category
        ) ?? null;

        if(roomObject === null) return;

        const model = roomObject.getModel();

        if(model === null) return;

        const itemData = model.getString('furniture_itemdata');

        if(itemData.length < 6) return;

        let colorHex: string;
        let text: string = '';

        if(itemData.indexOf(' ') > 0)
        {
            colorHex = itemData.slice(0, itemData.indexOf(' '));
            text = itemData.slice(itemData.indexOf(' ') + 1, itemData.length);
        }
        else
        {
            colorHex = itemData;
        }

        // AS3: room owner OR any-room controller may edit and delete.
        const controller = (this._container?.roomSession?.isRoomOwner ?? false)
            || (this._container?.sessionDataManager?.isAnyRoomController ?? false);

        this._container?.desktopEvents.emit(
            RoomWidgetStickieDataUpdateEvent.UPDATE_STICKIE_DATA,
            new RoomWidgetStickieDataUpdateEvent(
                RoomWidgetStickieDataUpdateEvent.UPDATE_STICKIE_DATA,
                message.id, roomObject.getType() ?? '', text, colorHex, controller
            )
        );
    }

    // AS3: FurnitureStickieWidgetHandler.as::getProcessedEvents()
    public getProcessedEvents(): string[]
    {
        return [];
    }

    // AS3: FurnitureStickieWidgetHandler.as::processEvent()
    public processEvent(_event: unknown): void
    {
        // AS3 no-op.
    }

    // AS3: FurnitureStickieWidgetHandler.as::update()
    public update(): void
    {
        // AS3 no-op.
    }

    // AS3: FurnitureStickieWidgetHandler.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: FurnitureStickieWidgetHandler.as::dispose()
    public dispose(): void
    {
        this._disposed = true;
        this._container = null;
    }
}

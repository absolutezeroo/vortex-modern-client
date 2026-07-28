/**
 * FurnitureTrophyWidgetHandler
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/FurnitureTrophyWidgetHandler.as
 *
 * Decodes a trophy's engraving out of the room object's model and hands it to the widget.
 * `furniture_data` is one tab-separated string: view-owner name, date, then the free-text
 * message (which may itself contain no tabs).
 */
import type {IRoomWidgetHandler} from '@habbo/ui/IRoomWidgetHandler';
import type {IRoomWidgetHandlerContainer} from '@habbo/ui/IRoomWidgetHandlerContainer';
import {RoomWidgetTrophyDataUpdateEvent} from '@habbo/ui/widget/events/RoomWidgetTrophyDataUpdateEvent';
import {RoomWidgetFurniToWidgetMessage} from '@habbo/ui/widget/messages/RoomWidgetFurniToWidgetMessage';

export class FurnitureTrophyWidgetHandler implements IRoomWidgetHandler
{
    // AS3: FurnitureTrophyWidgetHandler.as::_SafeStr_5769
    private _disposed: boolean = false;

    // AS3: FurnitureTrophyWidgetHandler.as::_container
    private _container: IRoomWidgetHandlerContainer | null = null;

    // AS3: FurnitureTrophyWidgetHandler.as::get type()
    public get type(): string
    {
        return 'RWE_FURNI_TROPHY_WIDGET';
    }

    // AS3: FurnitureTrophyWidgetHandler.as::set container()
    public set container(value: IRoomWidgetHandlerContainer | null)
    {
        this._container = value;
    }

    // AS3: FurnitureTrophyWidgetHandler.as::getWidgetMessages()
    public getWidgetMessages(): string[]
    {
        return [RoomWidgetFurniToWidgetMessage.WIDGET_MESSAGE_REQUEST_TROPHY_WIDGET];
    }

    /**
     * AS3: FurnitureTrophyWidgetHandler.as::processWidgetMessage()
     *
     * Returns null in every branch, exactly as AS3 does — the result reaches the widget
     * through the dispatched RoomWidgetTrophyDataUpdateEvent, not through the return value.
     */
    // AS3: FurnitureTrophyWidgetHandler.as::processWidgetMessage()
    public processWidgetMessage(message: unknown): unknown
    {
        if(this.disposed || message === null || message === undefined) return null;

        const widgetMessage = message as RoomWidgetFurniToWidgetMessage;

        if(widgetMessage.type !== RoomWidgetFurniToWidgetMessage.WIDGET_MESSAGE_REQUEST_TROPHY_WIDGET)
        {
            return null;
        }

        const roomObject = this._container?.roomEngine?.getRoomObject(
            widgetMessage.roomId, widgetMessage.id, widgetMessage.category
        ) ?? null;

        if(roomObject === null) return null;

        const model = roomObject.getModel();

        if(model === null) return null;

        const color = model.getNumber('furniture_color');
        const extras = parseInt(model.getString('furniture_extras'));

        // AS3 splits on the first two tabs and keeps the remainder verbatim, so a message
        // containing tabs survives intact.
        let data = model.getString('furniture_data');
        const name = data.substring(0, data.indexOf('\t'));

        data = data.substring(name.length + 1, data.length);

        const date = data.substring(0, data.indexOf('\t'));
        const text = data.substring(date.length + 1, data.length);

        this._container?.desktopEvents.emit(
            RoomWidgetTrophyDataUpdateEvent.UPDATE_TROPHY_DATA,
            new RoomWidgetTrophyDataUpdateEvent(
                RoomWidgetTrophyDataUpdateEvent.UPDATE_TROPHY_DATA, color, name, date, text, extras
            )
        );

        return null;
    }

    // AS3: FurnitureTrophyWidgetHandler.as::getProcessedEvents()
    public getProcessedEvents(): string[]
    {
        return [];
    }

    // AS3: FurnitureTrophyWidgetHandler.as::processEvent()
    public processEvent(_event: unknown): void
    {
        // AS3 no-op.
    }

    // AS3: FurnitureTrophyWidgetHandler.as::update()
    public update(): void
    {
        // AS3 no-op.
    }

    // AS3: FurnitureTrophyWidgetHandler.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: FurnitureTrophyWidgetHandler.as::dispose()
    public dispose(): void
    {
        this._disposed = true;
        this._container = null;
    }
}

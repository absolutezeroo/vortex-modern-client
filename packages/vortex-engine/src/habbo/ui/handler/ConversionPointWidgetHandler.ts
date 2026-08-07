import type {IRoomWidgetHandler} from '../IRoomWidgetHandler';
import type {IRoomWidgetHandlerContainer} from '../IRoomWidgetHandlerContainer';
import type {RoomWidgetMessage} from '../widget/messages/RoomWidgetMessage';
import type {RoomWidgetUpdateEvent} from '../widget/events/RoomWidgetUpdateEvent';
import {RoomWidgetConversionPointMessage} from '../widget/messages/RoomWidgetConversionPointMessage';

/**
 * Forwards one tracking message to the server's event log, and does nothing else — it processes
 * no room events at all.
 *
 * Its widget is a bare `RoomWidgetBase` with no window, built only so `createWidget()` gets a
 * non-null back; the handler is the entire feature.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/ConversionPointWidgetHandler.as
 */
export class ConversionPointWidgetHandler implements IRoomWidgetHandler
{
    // AS3: .../handler/ConversionPointWidgetHandler.as::_disposed
    private _disposed: boolean = false;

    // AS3: .../handler/ConversionPointWidgetHandler.as::_container
    private _container: IRoomWidgetHandlerContainer | null = null;

    // AS3: .../handler/ConversionPointWidgetHandler.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: .../handler/ConversionPointWidgetHandler.as::get type()
    get type(): string
    {
        return 'RWE_CONVERSION_TRACKING';
    }

    // AS3: .../handler/ConversionPointWidgetHandler.as::set container()
    set container(value: IRoomWidgetHandlerContainer | null)
    {
        this._container = value;
    }

    // AS3: .../handler/ConversionPointWidgetHandler.as::getWidgetMessages()
    getWidgetMessages(): string[]
    {
        return [RoomWidgetConversionPointMessage.CONVERSION_POINT];
    }

    /**
     * AS3: .../handler/ConversionPointWidgetHandler.as::processWidgetMessage()
     *
     * The type is checked *before* the cast here, unlike its siblings which cast first — so a
     * message of another type never reaches the cast at all.
     */
    processWidgetMessage(message: RoomWidgetMessage): RoomWidgetUpdateEvent | null
    {
        if(message.type === RoomWidgetConversionPointMessage.CONVERSION_POINT)
        {
            if(!(message instanceof RoomWidgetConversionPointMessage)) return null;

            this._container?.roomSession?.sendConversionPoint(
                message.category,
                message.pointType,
                message.action,
                message.extraString,
                message.extraInt
            );
        }

        return null;
    }

    // AS3: .../handler/ConversionPointWidgetHandler.as::getProcessedEvents()
    // Empty: nothing in the room makes this fire.
    getProcessedEvents(): string[]
    {
        return [];
    }

    // AS3: .../handler/ConversionPointWidgetHandler.as::processEvent()
    // Empty in AS3 too.
    processEvent(_event: unknown): void
    {
    }

    // AS3: .../handler/ConversionPointWidgetHandler.as::update()
    // Empty in AS3 too.
    update(): void
    {
    }

    // AS3: .../handler/ConversionPointWidgetHandler.as::dispose()
    dispose(): void
    {
        this._disposed = true;
        this._container = null;
    }
}

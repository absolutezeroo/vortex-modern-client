/**
 * PlaceholderWidgetHandler
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/PlaceholderWidgetHandler.as
 *
 * Opens the placeholder window for a furni the client has no visualization for.
 *
 * The decompiled source returns `null` from `type` and `getProcessedEvents()`, and hardcodes
 * `disposed` to `false`. Those are defects in the source, not behaviour — every sibling handler
 * returns a real type, an array, and a backed flag, and so does this one.
 */
import type {IRoomWidgetHandler} from '@habbo/ui/IRoomWidgetHandler';
import type {IRoomWidgetHandlerContainer} from '@habbo/ui/IRoomWidgetHandlerContainer';
import {RoomWidgetShowPlaceholderEvent} from '@habbo/ui/widget/events/RoomWidgetShowPlaceholderEvent';
import {RoomWidgetFurniToWidgetMessage} from '@habbo/ui/widget/messages/RoomWidgetFurniToWidgetMessage';

export class PlaceholderWidgetHandler implements IRoomWidgetHandler
{
    // AS3: PlaceholderWidgetHandler.as::get disposed() — no backing field there; see the class note.
    private _disposed: boolean = false;

    // AS3: PlaceholderWidgetHandler.as::_container
    private _container: IRoomWidgetHandlerContainer | null = null;

    /**
     * The type `RoomDesktop.createWidget()` keys this handler on (`RoomDesktop.as:780`).
     */
    // AS3: PlaceholderWidgetHandler.as::get type()
    public get type(): string
    {
        return 'RWE_FURNI_PLACEHOLDER';
    }

    // AS3: PlaceholderWidgetHandler.as::set container()
    public set container(value: IRoomWidgetHandlerContainer | null)
    {
        this._container = value;
    }

    // AS3: PlaceholderWidgetHandler.as::getWidgetMessages()
    public getWidgetMessages(): string[]
    {
        return [RoomWidgetFurniToWidgetMessage.WIDGET_MESSAGE_REQUEST_PLACEHOLDER_WIDGET];
    }

    /**
     * Dispatches unconditionally, as AS3 does — it reads the message type into a local it never
     * uses. Harmless either way: `getWidgetMessages()` registers exactly one type, so the switch
     * AS3 never wrote would have had a single branch.
     */
    // AS3: PlaceholderWidgetHandler.as::processWidgetMessage()
    public processWidgetMessage(_message: unknown): unknown
    {
        if(this.disposed) return null;

        this._container?.desktopEvents.emit(
            RoomWidgetShowPlaceholderEvent.SHOW_PLACEHOLDER,
            new RoomWidgetShowPlaceholderEvent(RoomWidgetShowPlaceholderEvent.SHOW_PLACEHOLDER)
        );

        return null;
    }

    // AS3: PlaceholderWidgetHandler.as::getProcessedEvents()
    public getProcessedEvents(): string[]
    {
        return [];
    }

    // AS3: PlaceholderWidgetHandler.as::processEvent()
    public processEvent(_event: unknown): void
    {
        // AS3 no-op.
    }

    // AS3: PlaceholderWidgetHandler.as::update()
    public update(): void
    {
        // AS3 no-op.
    }

    // AS3: PlaceholderWidgetHandler.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: PlaceholderWidgetHandler.as::dispose()
    public dispose(): void
    {
        this._disposed = true;
        this._container = null;
    }
}

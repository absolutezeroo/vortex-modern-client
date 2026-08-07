import type {IRoomWidgetHandler} from '../IRoomWidgetHandler';
import type {IRoomWidgetHandlerContainer} from '../IRoomWidgetHandlerContainer';
import type {RoomWidgetMessage} from '../widget/messages/RoomWidgetMessage';
import type {RoomWidgetUpdateEvent} from '../widget/events/RoomWidgetUpdateEvent';
import type {Component} from '@core/runtime/Component';
import {RoomEngineToWidgetEvent} from '@habbo/room/events/RoomEngineToWidgetEvent';
import {RoomObjectVariableEnum} from '@habbo/room/object/RoomObjectVariableEnum';

/**
 * Follows the link a clicked piece of furniture carries — the one thing this handler does.
 *
 * It is the only widget type with **no widget at all**: `RoomWidgetFactory` has no
 * `RWE_INTERNAL_LINK` case, so `createWidget()` builds the handler, registers it for its one
 * room-engine event, gets null back from the factory and returns. The handler stays live in the
 * event table, which is the whole mechanism.
 *
 * Class name DERIVED: the AS3 file is `_SafeCls_3630.as` and the identifier exists in no tree.
 * It is named after the widget type it declares, `RWE_INTERNAL_LINK`, the way its siblings are.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/_SafeCls_3630.as
 */
export class InternalLinkWidgetHandler implements IRoomWidgetHandler
{
    // AS3: .../handler/_SafeCls_3630.as::INTERNAL_LINK_KEY
    private static readonly INTERNAL_LINK_KEY: string = 'internalLink';

    // AS3: .../handler/_SafeCls_3630.as::_container
    private _container: IRoomWidgetHandlerContainer | null = null;

    // AS3: .../handler/_SafeCls_3630.as::get type()
    get type(): string
    {
        return 'RWE_INTERNAL_LINK';
    }

    /**
     * AS3: .../handler/_SafeCls_3630.as::get disposed()
     *
     * Unlike every other handler this one keeps no `_disposed` flag: a null container *is* the
     * disposed state, because `dispose()` only nulls the container.
     */
    get disposed(): boolean
    {
        return this._container === null;
    }

    // AS3: .../handler/_SafeCls_3630.as::set container()
    set container(value: IRoomWidgetHandlerContainer | null)
    {
        this._container = value;
    }

    // AS3: .../handler/_SafeCls_3630.as::getWidgetMessages()
    // Returns null, not [] — this handler answers no widget messages at all. RoomDesktop tolerates
    // null here for exactly this case.
    getWidgetMessages(): string[] | null
    {
        return null;
    }

    // AS3: .../handler/_SafeCls_3630.as::processWidgetMessage()
    processWidgetMessage(_message: RoomWidgetMessage): RoomWidgetUpdateEvent | null
    {
        return null;
    }

    // AS3: .../handler/_SafeCls_3630.as::getProcessedEvents()
    getProcessedEvents(): string[]
    {
        return [RoomEngineToWidgetEvent.REQUEST_INTERNAL_LINK];
    }

    /**
     * AS3: .../handler/_SafeCls_3630.as::processEvent()
     *
     * The link is looked for in two places, in order: the `internalLink` entry of the object's
     * `furniture_data` string map, and — only when that is missing or empty — the flat
     * `furniture_internal_link` model string. Two storage shapes for the same thing, because the
     * editable variant writes the map and the fixed one writes the string.
     *
     * An empty link is not followed. `createLinkEvent` is the client-wide link bus, the same one
     * the notification bubbles and the club centre use.
     */
    processEvent(event: RoomEngineToWidgetEvent): void
    {
        if(event.type !== RoomEngineToWidgetEvent.REQUEST_INTERNAL_LINK) return;

        const roomEngine = this._container?.roomEngine ?? null;

        if(roomEngine === null) return;

        const object = roomEngine.getRoomObject(event.roomId, event.objectId, event.category);

        if(object === null) return;

        const model = object.getModel();

        let link: string | null =
            model.getStringToStringMap(RoomObjectVariableEnum.FURNITURE_DATA)
                ?.get(InternalLinkWidgetHandler.INTERNAL_LINK_KEY) ?? null;

        if(link === null || link.length === 0)
        {
            link = model.getString(RoomObjectVariableEnum.FURNITURE_INTERNAL_LINK);
        }

        if(link === null || link.length === 0) return;

        // AS3 casts the engine to Component to reach `context`; RoomEngine is one here too, but
        // IRoomEngine does not declare `context`, so the cast is the same one AS3 makes.
        (roomEngine as unknown as Component).context?.createLinkEvent(link);
    }

    // AS3: .../handler/_SafeCls_3630.as::update()
    // Empty in AS3 too.
    update(): void
    {
    }

    // AS3: .../handler/_SafeCls_3630.as::dispose()
    // No `_disposed` flag to raise — see `get disposed()`.
    dispose(): void
    {
        this._container = null;
    }
}

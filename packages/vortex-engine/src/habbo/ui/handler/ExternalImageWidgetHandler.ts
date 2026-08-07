import type {IRoomWidgetHandler} from '../IRoomWidgetHandler';
import type {IRoomWidgetHandlerContainer} from '../IRoomWidgetHandlerContainer';
import type {RoomWidgetMessage} from '../widget/messages/RoomWidgetMessage';
import type {RoomWidgetUpdateEvent} from '../widget/events/RoomWidgetUpdateEvent';
import type {IMessageComposer} from '@core/communication/messages/IMessageComposer';
import type {ExternalImageWidget} from '../widget/furniture/externalimage/ExternalImageWidget';
import {RoomEngineToWidgetEvent} from '@habbo/room/events/RoomEngineToWidgetEvent';
import {RoomEngineUseProductEvent} from '@habbo/room/events/RoomEngineUseProductEvent';
import {RoomObjectCategoryEnum} from '@habbo/room/object/RoomObjectCategoryEnum';

/**
 * The photo / selfie wall item — the "stories image" widget.
 *
 * It is the only widget handler that opens its widget from **two** unrelated sources: the usual
 * `RETWE_OPEN_WIDGET` when the furni in the room is clicked, and `ROSM_USE_PRODUCT_FROM_INVENTORY`
 * when the item is still in the inventory and has never been placed. The two take different paths
 * into the widget (`showWithRoomObject` vs `showWithFurniID`) because an unplaced item has no room
 * object to read the JSON off.
 *
 * The handler also carries the four `stories.*` configuration lookups. They live here rather than
 * in the widget because the widget has no container of its own — it reaches config through
 * `ownHandler`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/ExternalImageWidgetHandler.as
 */
export class ExternalImageWidgetHandler implements IRoomWidgetHandler
{
    // AS3: .../handler/ExternalImageWidgetHandler.as::URL_BASE_DISABLED
    // Name DERIVED: AS3 compares `storiesImageUrlBase` to the literal "disabled" inside
    // `ExternalImageWidget.show()`; the sentinel is not a named constant in any tree.
    public static readonly URL_BASE_DISABLED: string = 'disabled';

    // AS3: .../handler/ExternalImageWidgetHandler.as::REMOVE_RIGHTS_LEVEL
    // Name DERIVED: the 4 AS3 compares `roomControllerLevel` against inline — room owner and
    // above, so a plain rights-holder cannot delete someone else's photo.
    private static readonly REMOVE_RIGHTS_LEVEL: number = 4;

    // AS3: .../handler/ExternalImageWidgetHandler.as::_disposed
    private _disposed: boolean = false;

    // AS3: .../handler/ExternalImageWidgetHandler.as::_container
    private _container: IRoomWidgetHandlerContainer | null = null;

    // AS3: .../handler/ExternalImageWidgetHandler.as::_widget
    // Name DERIVED (`_SafeStr_4549`): the widget assigns itself here from its own constructor,
    // through the setter below.
    private _widget: ExternalImageWidget | null = null;

    // AS3: .../handler/ExternalImageWidgetHandler.as::get disposed()
    get disposed(): boolean
    {
        return this._disposed;
    }

    // AS3: .../handler/ExternalImageWidgetHandler.as::get type()
    get type(): string
    {
        return 'RWE_EXTERNAL_IMAGE';
    }

    // AS3: .../handler/ExternalImageWidgetHandler.as::get container()
    get container(): IRoomWidgetHandlerContainer | null
    {
        return this._container;
    }

    // AS3: .../handler/ExternalImageWidgetHandler.as::set container()
    set container(value: IRoomWidgetHandlerContainer | null)
    {
        this._container = value;
    }

    // AS3: .../handler/ExternalImageWidgetHandler.as::set widget()
    // Write-only in AS3 too — the widget hands itself over and nothing reads it back out.
    set widget(value: ExternalImageWidget | null)
    {
        this._widget = value;
    }

    // AS3: .../handler/ExternalImageWidgetHandler.as::getWidgetMessages()
    // Null, not empty: this widget answers no widget messages at all, only engine events.
    getWidgetMessages(): string[] | null
    {
        return null;
    }

    // AS3: .../handler/ExternalImageWidgetHandler.as::processWidgetMessage()
    processWidgetMessage(_message: RoomWidgetMessage): RoomWidgetUpdateEvent | null
    {
        return null;
    }

    /**
     * Only the inventory event is declared here. `RETWE_OPEN_WIDGET` / `RETWE_CLOSE_WIDGET` are
     * handled in `processEvent()` without being listed — the room desktop routes those to every
     * handler by widget type rather than by this list, so declaring them would be redundant.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/ExternalImageWidgetHandler.as::getProcessedEvents()
    getProcessedEvents(): string[] | null
    {
        return [RoomEngineUseProductEvent.USE_PRODUCT_FROM_INVENTORY];
    }

    /**
     * The use-product branch does **not** return: AS3 falls through to the
     * `as RoomEngineToWidgetEvent` cast below, which yields null for a use-product event (the two
     * are siblings under `RoomEngineObjectEvent`, not parent and child), so the method exits
     * there. Kept as written rather than folded into an else — the shape is what makes the
     * fall-through harmless.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/ExternalImageWidgetHandler.as::processEvent()
    processEvent(event: unknown): void
    {
        if(this._container === null || this._container.roomEngine === null) return;

        if(event instanceof RoomEngineUseProductEvent)
        {
            if(event.type === RoomEngineUseProductEvent.USE_PRODUCT_FROM_INVENTORY)
            {
                // AS3 dereferences the widget unguarded here. It cannot be null in practice —
                // the widget assigns itself in its own constructor, and the desktop creates the
                // handler and the widget together — but a null here would take the room UI down.
                this._widget?.showWithFurniID(event.objectId);
            }
        }

        if(!(event instanceof RoomEngineToWidgetEvent)) return;

        const object = this._container.roomEngine.getRoomObject(event.roomId, event.objectId, event.category);

        switch(event.type)
        {
            case RoomEngineToWidgetEvent.REQUEST_OPEN_WIDGET:
                if(object !== null) this._widget?.showWithRoomObject(object);

                break;

            case RoomEngineToWidgetEvent.REQUEST_CLOSE_WIDGET:
                this._widget?.hide();

                break;
        }
    }

    /**
     * Deletes the wall item outright, with no server round trip of its own — `deleteRoomObject()`
     * is the sticky-note delete path, which composes the removal message itself.
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/handler/ExternalImageWidgetHandler.as::deleteCard()
    deleteCard(objectId: number): void
    {
        if(this._container !== null && this._container.roomEngine !== null)
        {
            this._container.roomEngine.deleteRoomObject(objectId, RoomObjectCategoryEnum.OBJECT_CATEGORY_WALL);
        }
    }

    // AS3: .../handler/ExternalImageWidgetHandler.as::isRoomOwner()
    // Declared and called by nothing, in AS3 too — the widget gates on hasRightsToRemove().
    isRoomOwner(): boolean
    {
        return this._container?.roomSession?.isRoomOwner ?? false;
    }

    // AS3: .../handler/ExternalImageWidgetHandler.as::hasRightsToRemove()
    hasRightsToRemove(): boolean
    {
        return (this._container?.roomSession?.roomControllerLevel ?? 0) >= ExternalImageWidgetHandler.REMOVE_RIGHTS_LEVEL;
    }

    // AS3: .../handler/ExternalImageWidgetHandler.as::sendMessage()
    sendMessage(composer: IMessageComposer<unknown[]>): void
    {
        this._container?.connection?.send(composer);
    }

    // AS3: .../handler/ExternalImageWidgetHandler.as::get storiesImageUrlBase()
    // "disabled" here switches the whole widget off — see `URL_BASE_DISABLED`.
    get storiesImageUrlBase(): string
    {
        return this._container?.config?.getProperty('stories.image_url_base') ?? '';
    }

    // AS3: .../handler/ExternalImageWidgetHandler.as::get storiesImageShareUrl()
    // A "%id%" template; the widget substitutes the photo's unique id into it.
    get storiesImageShareUrl(): string
    {
        return this._container?.config?.getProperty('stories.image.sharing_url_base') ?? '';
    }

    // AS3: .../handler/ExternalImageWidgetHandler.as::get extraDataServiceUrl()
    get extraDataServiceUrl(): string
    {
        return this._container?.config?.getProperty('extra_data_service_url') ?? '';
    }

    // AS3: .../handler/ExternalImageWidgetHandler.as::isSelfieReportingEnabled()
    // A string comparison against "true", not getBoolean() — an unset key reads as "" and so
    // disables reporting, which is the intended default.
    isSelfieReportingEnabled(): boolean
    {
        return this._container?.config?.getProperty('stories.report.selfie.enabled') === 'true';
    }

    // AS3: .../handler/ExternalImageWidgetHandler.as::update()
    // Empty in AS3 too.
    update(): void
    {
    }

    // AS3: .../handler/ExternalImageWidgetHandler.as::dispose()
    // AS3 does not null the widget here; the widget disposes itself and the handler goes with it.
    dispose(): void
    {
        this._container = null;
        this._disposed = true;
    }
}

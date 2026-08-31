import {Logger} from '@core/utils/Logger';
import type {RoomEngineToWidgetEvent} from '@habbo/room/events/RoomEngineToWidgetEvent';
import {RoomObjectVariableEnum} from '@habbo/room/object/RoomObjectVariableEnum';
import type {IRoomWidgetHandler} from '@habbo/ui/IRoomWidgetHandler';
import type {IRoomWidgetHandlerContainer} from '@habbo/ui/IRoomWidgetHandlerContainer';

import type {FishingSpotWidget} from './FishingSpotWidget';

const log = Logger.getLogger('vortex.fishing.ui.FishingSpotWidgetHandler');

/**
 * The fishing spot's handler.
 *
 * NOT ported from AS3 — Vortex-only system, no Habbo equivalent and therefore no AS3 source to
 * trace to. See `docs/vortex-original/fishing.md` §2.3.
 *
 * It takes no widget-bus *messages*: everything this feature reacts to arrives over the wire, so
 * `getWidgetMessages()` returns null, the same answer `RentableSpaceWidgetHandler` gives.
 *
 * **`getProcessedEvents()` returns `[]`, not null, and the difference is the whole widget.**
 * `RoomDesktop` appends the open/close pair to whatever this returns, and appends nothing to null —
 * so a null here means the panel is never opened by a click on the furni, which is the fourth of the
 * silent wirings and the one that had this widget built, registered and unreachable.
 *
 * The handler still has to exist for its own sake. `RoomDesktop` builds one per widget type before
 * the widget itself, and a missing case there is one of the three other silent failures.
 */
export class FishingSpotWidgetHandler implements IRoomWidgetHandler
{
    // TS-only: Vortex-only handler — no AS3 counterpart.
    private _container: IRoomWidgetHandlerContainer | null = null;

    // TS-only: Vortex-only handler — no AS3 counterpart.
    private _widget: FishingSpotWidget | null = null;

    // TS-only: Vortex-only handler — no AS3 counterpart.
    private _disposed: boolean = false;

    // TS-only: `IRoomWidgetHandler` contract — the id every one of the four wirings must agree on.
    public get type(): string
    {
        return 'RWE_FISHING_SPOT';
    }

    // TS-only: `IRoomWidgetHandler` contract.
    public set container(value: IRoomWidgetHandlerContainer | null)
    {
        this._container = value;
    }

    // TS-only: read by the widget to reach the room and the connection.
    public get container(): IRoomWidgetHandlerContainer | null
    {
        return this._container;
    }

    /** Set by the widget when it is built, so the handler can reach it if it ever needs to. */
    // TS-only: Vortex-only — the widget registers itself here.
    public set widget(value: FishingSpotWidget | null)
    {
        this._widget = value;
    }

    // TS-only: Vortex-only accessor.
    public get widget(): FishingSpotWidget | null
    {
        return this._widget;
    }

    /** Null, not `[]` — this widget is driven by wire messages, never by the widget bus. */
    // TS-only: `IRoomWidgetHandler` contract.
    public getWidgetMessages(): string[] | null
    {
        return null;
    }

    // TS-only: `IRoomWidgetHandler` contract — unreachable while `getWidgetMessages()` is null.
    public processWidgetMessage(_message: unknown): unknown
    {
        return null;
    }

    /**
     * Empty, **not** null. `RoomDesktop` appends the open/close pair to whatever comes back here and
     * appends nothing to null, so returning null is what makes a clicked spot do nothing at all.
     */
    // TS-only: `IRoomWidgetHandler` contract.
    public getProcessedEvents(): string[]
    {
        return [];
    }

    /**
     * Opens the panel on the clicked spot and closes it again, the same shape
     * `RentableSpaceWidgetHandler` uses.
     *
     * The furni's class name comes from the session's furnidata rather than from the room object,
     * which carries only a type id — and the class name is what resolves the zone.
     */
    // TS-only: `IRoomWidgetHandler` contract.
    public processEvent(event: unknown): void
    {
        const roomEngine = this._container?.roomEngine ?? null;
        const widgetEvent = event as RoomEngineToWidgetEvent | null;

        if(roomEngine === null || widgetEvent === null) return;

        switch(widgetEvent.type)
        {
            case 'RETWE_OPEN_WIDGET':
            {
                const roomObject = roomEngine.getRoomObject(
                    widgetEvent.roomId, widgetEvent.objectId, widgetEvent.category
                );

                if(roomObject === null) return;

                const typeId = roomObject.getModel().getNumber(RoomObjectVariableEnum.FURNITURE_TYPE_ID);
                const furniData = this._container?.sessionDataManager?.getFloorItemData(typeId) ?? null;

                if(furniData === null)
                {
                    log.warn(`No furnidata for type ${typeId}; the fishing panel cannot name its zone.`);

                    return;
                }

                this._widget?.open(widgetEvent.objectId, furniData.className);
                break;
            }

            // Passed through even when the object is gone: the widget compares the id against the
            // spot it is showing and ignores a mismatch.
            case 'RETWE_CLOSE_WIDGET':
                this._widget?.close(widgetEvent.objectId);
        }
    }

    /**
     * Nothing per frame. The cue's countdown is animated by the widget from `durationMs`, and the
     * server is the authority on whether a sighting is still live.
     */
    // TS-only: `IRoomWidgetHandler` contract.
    public update(): void
    {
    }

    // TS-only: `IDisposable` contract.
    public get disposed(): boolean
    {
        return this._disposed;
    }

    // TS-only: `IDisposable` contract.
    public dispose(): void
    {
        this._disposed = true;
        this._container = null;
        this._widget = null;
    }
}

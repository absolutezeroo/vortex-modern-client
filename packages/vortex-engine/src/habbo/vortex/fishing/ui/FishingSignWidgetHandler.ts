import type {RoomEngineToWidgetEvent} from '@habbo/room/events/RoomEngineToWidgetEvent';
import type {IRoomWidgetHandler} from '@habbo/ui/IRoomWidgetHandler';
import type {IRoomWidgetHandlerContainer} from '@habbo/ui/IRoomWidgetHandlerContainer';

/**
 * The wooden fishing sign's handler: a click opens the Fish-O-Pedia.
 *
 * NOT ported from AS3 — Vortex-only system, no Habbo equivalent and therefore no AS3 source to
 * trace to. See `docs/vortex-original/fishing.md` §1 and §15.
 *
 * **It has no widget of its own.** The book is a standalone window `HabboFishing` owns and reuses,
 * so there is nothing for `RoomWidgetFactory` to build and nothing for `RoomDesktop` to parent —
 * this handler is the whole surface. `getProcessedEvents()` still has to return `[]` rather than
 * null, because `RoomDesktop` appends the open/close pair to whatever comes back and appends nothing
 * to null; that is the silent wiring that makes a clicked furni do nothing at all.
 *
 * Closing is deliberately not handled. `RETWE_CLOSE_WIDGET` fires when the furni is deselected, and
 * a book that shut itself the moment you looked away from the sign would be unusable — the reader
 * closes it with its own button.
 */
export class FishingSignWidgetHandler implements IRoomWidgetHandler
{
    // TS-only: Vortex-only handler — no AS3 counterpart for any member here.
    private _container: IRoomWidgetHandlerContainer | null = null;

    // TS-only: see above.
    private _disposed: boolean = false;

    // TS-only: `IRoomWidgetHandler` contract — the id every one of the wirings must agree on.
    public get type(): string
    {
        return 'RWE_FISHING_SIGN';
    }

    // TS-only: `IRoomWidgetHandler` contract.
    public set container(value: IRoomWidgetHandlerContainer | null)
    {
        this._container = value;
    }

    // TS-only: `IRoomWidgetHandler` contract.
    public get container(): IRoomWidgetHandlerContainer | null
    {
        return this._container;
    }

    /** Null — nothing on the widget bus reaches this. */
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

    /** Empty, **not** null; see the class note. */
    // TS-only: `IRoomWidgetHandler` contract.
    public getProcessedEvents(): string[]
    {
        return [];
    }

    // TS-only: `IRoomWidgetHandler` contract.
    public processEvent(event: unknown): void
    {
        const widgetEvent = event as RoomEngineToWidgetEvent | null;

        if(widgetEvent === null || widgetEvent.type !== 'RETWE_OPEN_WIDGET') return;

        this._container?.fishing?.openPedia();
    }

    /** Nothing per frame. */
    // TS-only: `IRoomWidgetHandler` contract.
    public update(): void
    {
    }

    // TS-only: `IDisposable`.
    public get disposed(): boolean
    {
        return this._disposed;
    }

    // TS-only: `IDisposable`.
    public dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;
        this._container = null;
    }
}

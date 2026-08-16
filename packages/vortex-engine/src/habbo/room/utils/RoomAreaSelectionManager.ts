import type {IRoomAreaSelectionManager} from '../IRoomAreaSelectionManager';
import type {IRoomEngine} from '../IRoomEngine';
import type {RoomObjectTileMouseEvent} from '../events/RoomObjectTileMouseEvent';
import type {RoomEngineObjectEvent} from '../events/RoomEngineObjectEvent';
import type {FurnitureVisualization} from '../object/visualization/furniture/FurnitureVisualization';

/**
 * Drag a rectangle across the room's floor tiles — the picker behind the wired `InArea` selectors.
 *
 * **It is a four-state machine, and the states are what make the drag safe.** `NOT_ACTIVE` until a
 * tool activates it; `NOT_SELECTING_AREA` while armed but idle; `AWAITING_MOUSE_DOWN` after the
 * "select" button, waiting for the first tile press; `SELECTING` while the pointer is down. Room
 * dragging is blocked for the whole of the last two, so the room does not scroll under the drag.
 *
 * **Shift is a shortcut for the button.** A shift-click on a tile while merely armed starts a
 * selection outright, which is how the AS3 client lets you re-drag without reopening the dialog.
 *
 * **Every furniture in the room is made see-through while active** (`lookThrough`), so a rectangle
 * drawn behind a wall of furni is still visible — and furniture that *arrives* mid-selection gets the
 * same treatment through the REOE_ADDED listener.
 *
 * PORT GAP — the highlight rectangle is not painted. `setHighlight()` records the area and AS3 then
 * hands it to `RoomVisualization.initializeHighlightArea()`, which needs the plane-level highlight
 * and a `ColorMatrixFilter` equivalent, neither of which this port has. The selection itself is fully
 * functional without it: the drag tracks tiles, the callback fires, and the wired def saves the area
 * — there is simply no live outline while dragging. See the TODO(AS3) on {@link setHighlight}.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/utils/RoomAreaSelectionManager.as
 */
export class RoomAreaSelectionManager implements IRoomAreaSelectionManager
{
    // AS3: RoomAreaSelectionManager.as::NOT_ACTIVE
    static readonly NOT_ACTIVE: number = 0;

    // AS3: RoomAreaSelectionManager.as::NOT_SELECTING_AREA
    static readonly NOT_SELECTING_AREA: number = 1;

    // AS3: RoomAreaSelectionManager.as::AWAITING_MOUSE_DOWN
    static readonly AWAITING_MOUSE_DOWN: number = 2;

    // AS3: RoomAreaSelectionManager.as::SELECTING
    static readonly SELECTING: number = 3;

    /**
	 * Furniture (10) and wall items (20) — the two categories made see-through. AS3 inlines both.
	 */
    // AS3: RoomAreaSelectionManager.as::getAllFurnis() — inline category (name derived)
    private static readonly CATEGORY_FLOOR: number = 10;

    // AS3: RoomAreaSelectionManager.as::getAllFurnis() — inline category (name derived)
    private static readonly CATEGORY_WALL: number = 20;

    // AS3: RoomAreaSelectionManager.as::_roomEngine
    private _roomEngine: IRoomEngine;

    // AS3: RoomAreaSelectionManager.as::_SafeStr_4711 (name derived: the state machine)
    private _state: number = RoomAreaSelectionManager.NOT_ACTIVE;

    // AS3: RoomAreaSelectionManager.as::_SafeStr_6751 (name derived: where the drag started, x)
    private _anchorX: number = 0;

    // AS3: RoomAreaSelectionManager.as::_SafeStr_6765 (name derived: where the drag started, y)
    private _anchorY: number = 0;

    // AS3: RoomAreaSelectionManager.as::_SafeStr_5951 (name derived: the tile under the pointer, x)
    private _cursorX: number = 0;

    // AS3: RoomAreaSelectionManager.as::_SafeStr_6068 (name derived: the tile under the pointer, y)
    private _cursorY: number = 0;

    // AS3: RoomAreaSelectionManager.as::_highlightRootX
    private _highlightRootX: number = 0;

    // AS3: RoomAreaSelectionManager.as::_highlightRootY
    private _highlightRootY: number = 0;

    // AS3: RoomAreaSelectionManager.as::_highlightWidth
    private _highlightWidth: number = 0;

    // AS3: RoomAreaSelectionManager.as::_highlightHeight
    private _highlightHeight: number = 0;

    // AS3: RoomAreaSelectionManager.as::_callback
    private _callback: ((x: number, y: number, width: number, height: number) => void) | null = null;

    // AS3: RoomAreaSelectionManager.as::_highlightType
    private _highlightType: string = 'highlight_brighten';

    // AS3: RoomAreaSelectionManager.as::RoomAreaSelectionManager()
    constructor(roomEngine: IRoomEngine)
    {
        this._roomEngine = roomEngine;
        this._roomEngine.events.on('REOE_ADDED', this.onRoomObjectAdded);
    }

    // AS3: RoomAreaSelectionManager.as::getAllFurnis()
    private getAllFurnis(): unknown[]
    {
        return [
            ...this._roomEngine.getObjectsByCategory(RoomAreaSelectionManager.CATEGORY_WALL),
            ...this._roomEngine.getObjectsByCategory(RoomAreaSelectionManager.CATEGORY_FLOOR),
        ];
    }

    // TS-only: no AS3 counterpart; AS3 casts `getVisualization() as FurnitureVisualization` and
    // null-checks the result at each of its three call sites.
    private setLookThrough(object: unknown, lookThrough: boolean): void
    {
        const visualization = (object as {getVisualization?: () => unknown} | null)?.getVisualization?.() ?? null;

        if(visualization === null) return;

        const furniture = visualization as Partial<FurnitureVisualization>;

        if(typeof furniture.lookThrough === 'boolean' || 'lookThrough' in furniture)
        {
            (furniture as FurnitureVisualization).lookThrough = lookThrough;
        }
    }

    /**
	 * Arms the next tile press. Clearing first is what stops the previous rectangle lingering under
	 * the new drag.
	 */
    // AS3: RoomAreaSelectionManager.as::startSelecting()
    startSelecting(): void
    {
        if(this._state !== RoomAreaSelectionManager.NOT_SELECTING_AREA) return;

        this.clearHighlightSilent();
        this._state = RoomAreaSelectionManager.AWAITING_MOUSE_DOWN;
        this._roomEngine.setMoveBlocked(true);
    }

    /**
	 * The drag itself. A press either starts the rectangle (armed, or shift held) or is ignored; a
	 * move only repaints when the pointer has actually crossed into another tile.
	 *
	 * The rectangle is normalised on every move, so dragging up-left from the anchor works exactly
	 * like dragging down-right.
	 */
    // AS3: RoomAreaSelectionManager.as::handleTileMouseEvent()
    handleTileMouseEvent(event: RoomObjectTileMouseEvent): void
    {
        let starting = this._state === RoomAreaSelectionManager.AWAITING_MOUSE_DOWN && event.type === 'ROE_MOUSE_DOWN';

        if(event.shiftKey
            && this._state === RoomAreaSelectionManager.NOT_SELECTING_AREA
            && event.type === 'ROE_MOUSE_DOWN')
        {
            this.startSelecting();
            starting = true;
        }

        if(starting)
        {
            this._state = RoomAreaSelectionManager.SELECTING;
            this._anchorX = event.tileXAsInt;
            this._anchorY = event.tileYAsInt;
            this._cursorX = event.tileXAsInt;
            this._cursorY = event.tileYAsInt;
            this.setHighlight(this._anchorX, this._anchorY, 1, 1);

            return;
        }

        if(this._state !== RoomAreaSelectionManager.SELECTING || event.type !== 'ROE_MOUSE_MOVE') return;

        if(event.tileXAsInt === this._cursorX && event.tileYAsInt === this._cursorY) return;

        this._cursorX = event.tileXAsInt;
        this._cursorY = event.tileYAsInt;

        let rootX: number;
        let width: number;
        let rootY: number;
        let height: number;

        if(this._cursorX > this._anchorX)
        {
            rootX = this._anchorX;
            width = this._cursorX - this._anchorX + 1;
        }
        else
        {
            rootX = this._cursorX;
            width = this._anchorX - this._cursorX + 1;
        }

        if(this._cursorY > this._anchorY)
        {
            rootY = this._anchorY;
            height = this._cursorY - this._anchorY + 1;
        }
        else
        {
            rootY = this._cursorY;
            height = this._anchorY - this._cursorY + 1;
        }

        this.setHighlight(rootX, rootY, width, height);
    }

    /**
	 * Ends the drag and hands the rectangle to whoever activated us. Returns whether it actually had
	 * a drag to end — the room engine uses that to decide whether the click was the selector's or the
	 * room's.
	 */
    // AS3: RoomAreaSelectionManager.as::finishSelecting()
    finishSelecting(): boolean
    {
        if(this._state !== RoomAreaSelectionManager.SELECTING) return false;

        this._state = RoomAreaSelectionManager.NOT_SELECTING_AREA;
        this._roomEngine.setMoveBlocked(false);
        this._callback?.(this._highlightRootX, this._highlightRootY, this._highlightWidth, this._highlightHeight);

        return true;
    }

    /**
	 * TS-only wrapper over what AS3 inlines: reach the room object's visualization and wipe the
	 * highlight. See {@link setHighlight} — the paint side is not ported, so this is a no-op today
	 * and is kept as the single place that will need it.
	 */
    // AS3: RoomAreaSelectionManager.as::clearHighlightSilent()
    private clearHighlightSilent(): void
    {
        // TODO(AS3): RoomVisualization.clearHighlightArea() — see setHighlight().
    }

    /**
	 * Cancels the selection *and tells the caller*, by firing the callback with a zero rectangle —
	 * that is how `InArea`'s "clear" button empties the stored area.
	 */
    // AS3: RoomAreaSelectionManager.as::clearHighlight()
    clearHighlight(): void
    {
        if(this._state === RoomAreaSelectionManager.NOT_ACTIVE) return;

        this.clearHighlightSilent();
        this._state = RoomAreaSelectionManager.NOT_SELECTING_AREA;
        this._roomEngine.setMoveBlocked(false);
        this._callback?.(0, 0, 0, 0);
    }

    /**
	 * Records the rectangle. AS3 also paints it.
	 *
	 * TODO(AS3): sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/utils/RoomAreaSelectionManager.as::setHighlight()
	 * ends with `RoomVisualization.initializeHighlightArea(x, y, w, h, HIGHLIGHT_FILTERS[type])`.
	 * Neither `initializeHighlightArea`/`clearHighlightArea` nor the three `ColorMatrixFilter` presets
	 * (`highlight_brighten`, `highlight_blue`, `highlight_darken`) are ported — they live in the plane
	 * rasterizer, which paints the floor. Until they are, the drag works but draws nothing; the stored
	 * rectangle below is what the wired def saves either way.
	 *
	 * The visualization is reached through `getRoomObject(activeRoomId, -1, 0)` — the room object
	 * itself is id -1, category 0.
	 */
    // AS3: RoomAreaSelectionManager.as::setHighlight()
    setHighlight(x: number, y: number, width: number, height: number): void
    {
        if(this._state === RoomAreaSelectionManager.NOT_ACTIVE) return;

        this._highlightRootX = x;
        this._highlightRootY = y;
        this._highlightWidth = width;
        this._highlightHeight = height;
    }

    /**
	 * Refuses to activate twice — a second tool asking while the first still holds it gets false, and
	 * `InArea` reads that as "not available" and greys its buttons.
	 */
    // AS3: RoomAreaSelectionManager.as::activate()
    activate(callback: (x: number, y: number, width: number, height: number) => void, highlight: string): boolean
    {
        if(this._state !== RoomAreaSelectionManager.NOT_ACTIVE) return false;

        this._callback = callback;
        this._highlightType = highlight;

        for(const furni of this.getAllFurnis())
        {
            this.setLookThrough(furni, true);
        }

        this._state = RoomAreaSelectionManager.NOT_SELECTING_AREA;

        return true;
    }

    // AS3: RoomAreaSelectionManager.as::deactivate()
    deactivate(): void
    {
        if(this._state === RoomAreaSelectionManager.NOT_ACTIVE) return;

        this._callback = null;

        for(const furni of this.getAllFurnis())
        {
            this.setLookThrough(furni, false);
        }

        // AS3 clears *after* nulling the callback, so the zero-rectangle notification of
        // clearHighlight() is deliberately swallowed on the way out.
        this.clearHighlight();
        this._state = RoomAreaSelectionManager.NOT_ACTIVE;
    }

    // AS3: RoomAreaSelectionManager.as::onRoomObjectAdded()
    private onRoomObjectAdded = (event: RoomEngineObjectEvent): void =>
    {
        if(this._state === RoomAreaSelectionManager.NOT_ACTIVE) return;

        if(event.type !== 'REOE_ADDED') return;

        if(event.roomId !== this._roomEngine.activeRoomId) return;

        if(event.category !== RoomAreaSelectionManager.CATEGORY_FLOOR
            && event.category !== RoomAreaSelectionManager.CATEGORY_WALL) return;

        const object = this._roomEngine.getRoomObject(event.roomId, event.objectId, event.category);

        if(object !== null) this.setLookThrough(object, true);
    };

    // AS3: RoomAreaSelectionManager.as::get areaSelectionState()
    get areaSelectionState(): number
    {
        return this._state;
    }

    // AS3: RoomAreaSelectionManager.as::dispose()
    dispose(): void
    {
        this.deactivate();
        this._roomEngine.events.off('REOE_ADDED', this.onRoomObjectAdded);
    }
}

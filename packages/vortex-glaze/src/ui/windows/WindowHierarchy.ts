import type {IWindow} from '@core/window/IWindow';
import type {WindowController} from '@core/window/WindowController';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import {WindowTreeInspector} from '@core/window/debugger';
import type {IWindowDebugNode} from '@core/window/debugger';
import {EditorEvents, type EditorState} from '../../state/EditorState';
import {canHaveChildren, dropNode, type DropPosition} from '../../ops/StructuralOps';
import type {CanvasSurface} from '../../canvas/CanvasSurface';
import {slotsOf} from '../LayoutSlots';

const ROW = slotsOf('glaze_hierarchy_row_xml');

interface IListLike { addListItem(item: IWindow): IWindow; destroyListItems(): void; }
interface IContainerLike { addChild(child: IWindow): IWindow; }
interface IToggle { isSelected: boolean; addEventListener(type: string, cb: () => void): void; }

const SELECTED_COLOR = 0xffef9a9a; // Glaze's pink selection tint
const CO_SELECTED_COLOR = 0xfff5cfcf; // secondary members of a multi-selection
const DROP_INSIDE_COLOR = 0xff9ad2ef;
const LABEL_COLOR = 0xffffffff;
const LABEL_HIDDEN_COLOR = 0xff9a9ab0;
const ROW_HEIGHT = 20;
const INDENT = 14;

/** Pixels the pointer must travel on a row before a click becomes a drag. */
const DRAG_SLOP = 4;

/** Hover time over a collapsed container before it springs open mid-drag. */
const AUTO_EXPAND_MS = 400;

/**
 * WindowHierarchy — the "Hierarchy View" tree as Habbo widget rows.
 *
 * Each node becomes a row (`region`) with a visibility `checkbox`, a collapse
 * twisty, and a `name [type]` label, indented by depth. Clicking a row selects
 * the node (pink highlight, à la Glaze), Ctrl-click adds or removes it from the
 * selection and Shift-click takes the range; the checkbox toggles `visible`, and
 * a node under a hidden ancestor is greyed to show it inherits that. Dragging a
 * row reparents or reorders it: the drop lands *before*, *inside* or *after* the
 * row under the pointer depending on where in its height the pointer sits, a
 * collapsed container springs open when hovered, and dropping past the last row
 * moves the node to the layout root. All Habbo widgets — no DOM.
 */
export class WindowHierarchy
{
    private readonly _state: EditorState;
    private readonly _list: IListLike;
    private readonly _wm: EditorState['runtime']['windowManager'];
    private readonly _surface: CanvasSurface | null;
    private readonly _rowByWindow: Map<IWindow, IWindow> = new Map();
    private readonly _windowByRow: Map<IWindow, IWindow> = new Map();
    private readonly _collapsed: Set<IWindow> = new Set();
    private _order: IWindow[] = [];
    private _rebuildScheduled = false;

    private _dragSource: IWindow | null = null;
    private _dragOrigin: { x: number; y: number } | null = null;
    private _dragging = false;
    private _dropTarget: IWindow | null = null;
    private _dropPosition: DropPosition = 'after';
    private _tintedRow: IWindow | null = null;
    private _indicator: IWindow | null = null;
    private _expandTimer = 0;
    private _expandCandidate: IWindow | null = null;
    private _docMove: ((e: MouseEvent) => void) | null = null;
    private _docUp: ((e: MouseEvent) => void) | null = null;

    public constructor(state: EditorState, list: IWindow, surface: CanvasSurface | null = null)
    {
        this._state = state;
        this._wm = state.runtime.windowManager;
        this._list = list as unknown as IListLike;
        this._surface = surface;

        state.events.on(EditorEvents.LAYOUT_CHANGED, this._scheduleRebuild);
        state.events.on(EditorEvents.TREE_CHANGED, this._scheduleRebuild);
        state.events.on(EditorEvents.DEBUG_CHANGED, this._scheduleRebuild);
        state.events.on(EditorEvents.SELECTION_CHANGED, this._refreshSelection);

        this._rebuild();
    }

    /** Expands every node (Glaze's "Expand"). */
    public expandAll(): void
    {
        this._collapsed.clear();
        this._scheduleRebuild();
    }

    /**
     * Coalesces rebuilds into a microtask so a widget is never disposed while it
     * is still processing its own event (a checkbox/twisty triggering a rebuild
     * would otherwise crash mid-update on a null context).
     */
    private readonly _scheduleRebuild = (): void =>
    {
        if(this._rebuildScheduled)
        {
            return;
        }

        this._rebuildScheduled = true;
        queueMicrotask(() =>
        {
            this._rebuildScheduled = false;
            this._rebuild();
        });
    };

    private readonly _rebuild = (): void =>
    {
        this._list.destroyListItems();
        this._rowByWindow.clear();
        this._windowByRow.clear();
        this._order = [];

        const root = this._state.rootWindow;

        if(!root || root.disposed)
        {
            return;
        }

        this.appendNode(WindowTreeInspector.snapshot(root), 0, false);
        this._refreshSelection();
    };

    private appendNode(node: IWindowDebugNode, depth: number, ancestorHidden: boolean): void
    {
        const row = this._wm.buildWidgetLayout('glaze_hierarchy_row_xml');

        if(!row)
        {
            return;
        }

        const rc = row as unknown as WindowController;
        const hasChildren = node.children.length > 0;
        const collapsed = this._collapsed.has(node.window);
        const shift = depth * INDENT;

        this.setX(ROW.find(row, 'glaze_row_vis'), 4 + shift);
        this.setX(ROW.find(row, 'glaze_row_twisty'), 26 + shift);

        const labelEl = ROW.findAs<WindowController & { text: string }>(row, 'glaze_row_label');

        if(labelEl)
        {
            const name = node.name ? `${node.name} ` : '';
            const tags = this._state.showTags && node.tags.length > 0 ? `  {${node.tags.join(',')}}` : '';

            labelEl.text = `${name}[${node.typeName}]${tags}`;
            labelEl.x = 42 + shift;
            // A node under a hidden ancestor renders nothing even with its own
            // `visible` still true — grey it so the tree says why.
            labelEl.color = (ancestorHidden || !node.visible) ? LABEL_HIDDEN_COLOR : LABEL_COLOR;
        }

        ROW.setText(row, 'glaze_row_arrow', hasChildren ? (collapsed ? '▸' : '▾') : '');

        // Visibility checkbox.
        const vis = ROW.findAs<IToggle>(row, 'glaze_row_vis');

        if(vis)
        {
            vis.isSelected = node.visible;
            vis.addEventListener('WE_SELECTED', () => { this.setVisible(node.window, true); });
            vis.addEventListener('WE_UNSELECTED', () => { this.setVisible(node.window, false); });
        }

        // Twisty collapses/expands (its own procedure, so it doesn't select).
        const twisty = ROW.findAs<WindowController>(row, 'glaze_row_twisty');

        if(twisty && hasChildren)
        {
            twisty.procedure = (event: WindowEvent): void =>
            {
                if(event.type === WindowMouseEvent.CLICK)
                {
                    this.toggleCollapse(node.window);
                }
            };
        }

        rc.height = ROW_HEIGHT;
        rc.procedure = (event: WindowEvent): void =>
        {
            // Selection runs on DOWN, not CLICK: only the down event carries the
            // Ctrl/Shift modifiers, and it is also where a row drag begins.
            if(event.type === WindowMouseEvent.DOWN)
            {
                this.onRowDown(node.window, event as WindowMouseEvent);
            }
        };

        this._list.addListItem(row);
        this._rowByWindow.set(node.window, row);
        this._windowByRow.set(row, node.window);
        this._order.push(node.window);

        if(hasChildren && !collapsed)
        {
            for(const child of node.children)
            {
                this.appendNode(child, depth + 1, ancestorHidden || !node.visible);
            }
        }
    }

    // ---- Selection ---------------------------------------------------------

    private onRowDown(window: IWindow, event: WindowMouseEvent): void
    {
        if(event.ctrlKey || event.altKey)
        {
            this._state.toggleSelected(window);

            return;
        }

        if(event.shiftKey)
        {
            this.selectRangeTo(window);

            return;
        }

        if(!this._state.isSelected(window))
        {
            this._state.select(window);
        }

        this.beginRowDrag(window, event);
    }

    /** Shift-click: everything between the primary selection and the clicked row. */
    private selectRangeTo(window: IWindow): void
    {
        const anchor = this._state.selected;
        const from = anchor ? this._order.indexOf(anchor) : -1;
        const to = this._order.indexOf(window);

        if(from < 0 || to < 0)
        {
            this._state.select(window);

            return;
        }

        const start = Math.min(from, to);
        const end = Math.max(from, to);

        this._state.selectMany(this._order.slice(start, end + 1));
    }

    // ---- Drag & drop -------------------------------------------------------

    private beginRowDrag(window: IWindow, event: WindowMouseEvent): void
    {
        if(window === this._state.rootWindow || !this._surface)
        {
            return;
        }

        this._dragSource = window;
        this._dragOrigin = {x: event.stageX, y: event.stageY};
        this._dragging = false;

        this._docMove = (e: MouseEvent): void => this.onDragMove(e);
        this._docUp = (): void => this.onDragUp();

        document.addEventListener('mousemove', this._docMove);
        document.addEventListener('mouseup', this._docUp);
    }

    private onDragMove(e: MouseEvent): void
    {
        if(!this._dragSource || !this._dragOrigin || !this._surface)
        {
            return;
        }

        if(!this._dragging)
        {
            const travelled = Math.abs(e.clientX - this._dragOrigin.x) + Math.abs(e.clientY - this._dragOrigin.y);

            if(travelled < DRAG_SLOP)
            {
                return;
            }

            this._dragging = true;
        }

        const point = this._surface.toCanvasCoords(e);
        const hit = this._wm.findWindowAtPoint(point.x, point.y);
        const row = this.rowOf(hit);

        if(!row)
        {
            this.clearDropFeedback();
            this._dropTarget = this.overList(point.x, point.y) ? this._state.rootWindow : null;
            this._dropPosition = 'inside';

            return;
        }

        const target = this._windowByRow.get(row) ?? null;

        if(!target || target === this._dragSource)
        {
            this.clearDropFeedback();
            this._dropTarget = null;

            return;
        }

        const rect = {x: 0, y: 0, width: 0, height: 0};

        row.getGlobalRectangle(rect);

        const ratio = rect.height > 0 ? (point.y - rect.y) / rect.height : 0.5;
        const insideAllowed = canHaveChildren(target) && target !== this._state.rootWindow;

        this._dropTarget = target;
        this._dropPosition = ratio < 0.3 ? 'before'
            : ratio > 0.7 ? 'after'
                : (insideAllowed ? 'inside' : (ratio < 0.5 ? 'before' : 'after'));

        // A collapsed container springs open when hovered, so a node can be
        // dropped into a branch without leaving the drag.
        if(this._dropPosition === 'inside' && this._collapsed.has(target))
        {
            this.armAutoExpand(target);
        }
        else
        {
            this.cancelAutoExpand();
        }

        this.showDropFeedback(row, rect);
    }

    private onDragUp(): void
    {
        const source = this._dragSource;
        const target = this._dropTarget;
        const position = this._dropPosition;
        const dragged = this._dragging;

        this.endRowDrag();

        if(!dragged || !source || !target || source.disposed || target.disposed)
        {
            return;
        }

        if(target === this._state.rootWindow && position !== 'inside')
        {
            return;
        }

        dropNode(this._state, source, target, position);
    }

    private endRowDrag(): void
    {
        if(this._docMove) document.removeEventListener('mousemove', this._docMove);
        if(this._docUp) document.removeEventListener('mouseup', this._docUp);

        this._docMove = null;
        this._docUp = null;
        this._dragSource = null;
        this._dragOrigin = null;
        this._dragging = false;
        this._dropTarget = null;
        this.cancelAutoExpand();
        this.clearDropFeedback();
    }

    /** The registered row a hit window belongs to (rows own nested widgets). */
    private rowOf(hit: IWindow | null): IWindow | null
    {
        let node: IWindow | null = hit;

        while(node)
        {
            if(this._windowByRow.has(node))
            {
                return node;
            }

            node = node.parent;
        }

        return null;
    }

    /** True when the point is over the tree list but past its last row. */
    private overList(x: number, y: number): boolean
    {
        const list = this._list as unknown as IWindow;

        if(!list || list.disposed)
        {
            return false;
        }

        const rect = {x: 0, y: 0, width: 0, height: 0};

        list.getGlobalRectangle(rect);

        return x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height;
    }

    private armAutoExpand(target: IWindow): void
    {
        if(this._expandCandidate === target)
        {
            return;
        }

        this.cancelAutoExpand();
        this._expandCandidate = target;
        this._expandTimer = window.setTimeout(() =>
        {
            this._expandTimer = 0;
            this._expandCandidate = null;
            this._collapsed.delete(target);
            this._scheduleRebuild();
        }, AUTO_EXPAND_MS);
    }

    private cancelAutoExpand(): void
    {
        if(this._expandTimer)
        {
            window.clearTimeout(this._expandTimer);
        }

        this._expandTimer = 0;
        this._expandCandidate = null;
    }

    /**
     * Paints the drop hint: a line above/below the row for before/after, and a
     * blue tint on the row itself for a drop inside it.
     */
    private showDropFeedback(row: IWindow, rect: { x: number; y: number; width: number; height: number }): void
    {
        this.clearDropFeedback();

        if(this._dropPosition === 'inside')
        {
            const controller = row as unknown as WindowController;

            controller.background = true;
            controller.color = DROP_INSIDE_COLOR;
            this._tintedRow = row;

            return;
        }

        const indicator = this.indicator();

        if(!indicator)
        {
            return;
        }

        const parent = indicator.parent;

        if(!parent)
        {
            return;
        }

        const parentRect = {x: 0, y: 0, width: 0, height: 0};

        parent.getGlobalRectangle(parentRect);

        const y = this._dropPosition === 'before' ? rect.y : rect.y + rect.height;

        (indicator as unknown as WindowController).rectangle = {
            x: rect.x - parentRect.x,
            y: Math.round(y - parentRect.y) - 1,
            width: rect.width,
            height: 2
        };
        indicator.visible = true;
    }

    private clearDropFeedback(): void
    {
        if(this._tintedRow && !this._tintedRow.disposed)
        {
            this._tintedRow = null;
            this._refreshSelection();
        }

        if(this._indicator && !this._indicator.disposed)
        {
            this._indicator.visible = false;
        }
    }

    /** The 2px drop line, built once next to the list so it floats over the rows. */
    private indicator(): IWindow | null
    {
        if(this._indicator && !this._indicator.disposed)
        {
            return this._indicator;
        }

        const list = this._list as unknown as IWindow;
        const parent = list?.parent;

        if(!parent || parent.disposed)
        {
            return null;
        }

        const bar = this._wm.buildWidgetLayout('glaze_swatch_xml');

        if(!bar)
        {
            return null;
        }

        (parent as unknown as IContainerLike).addChild(bar);
        (bar as unknown as WindowController).color = 0xff12b5c9;
        bar.visible = false;
        this._indicator = bar;

        return bar;
    }

    private setX(win: IWindow | null, x: number): void
    {
        if(win) (win as unknown as WindowController).x = x;
    }

    private setVisible(win: IWindow, visible: boolean): void
    {
        // No tree rebuild here: toggling visibility must not dispose this very
        // checkbox mid-event. The canvas redraws from the `visible` setter itself.
        if(!win.disposed)
        {
            (win as unknown as WindowController).visible = visible;
            // Descendants inherit the change, so the greying has to catch up.
            this._scheduleRebuild();
        }
    }

    private toggleCollapse(win: IWindow): void
    {
        if(this._collapsed.has(win)) this._collapsed.delete(win);
        else this._collapsed.add(win);

        this._scheduleRebuild();
    }

    private readonly _refreshSelection = (): void =>
    {
        const primary = this._state.selected;

        for(const [win, row] of this._rowByWindow)
        {
            const rc = row as unknown as WindowController;
            const selected = this._state.isSelected(win);

            rc.background = selected;
            rc.color = selected ? (win === primary ? SELECTED_COLOR : CO_SELECTED_COLOR) : 0x00ffffff;
        }
    };

    public dispose(): void
    {
        this.endRowDrag();
        this._state.events.off(EditorEvents.LAYOUT_CHANGED, this._scheduleRebuild);
        this._state.events.off(EditorEvents.TREE_CHANGED, this._scheduleRebuild);
        this._state.events.off(EditorEvents.DEBUG_CHANGED, this._scheduleRebuild);
        this._state.events.off(EditorEvents.SELECTION_CHANGED, this._refreshSelection);
        this._indicator?.destroy();
        this._indicator = null;
        this._list.destroyListItems();
        this._rowByWindow.clear();
        this._windowByRow.clear();
    }
}

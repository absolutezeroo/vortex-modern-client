import type {IWindow} from '@core/window/IWindow';
import type {WindowController} from '@core/window/WindowController';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import {WindowTreeInspector} from '@core/window/debugger';
import type {IWindowDebugNode} from '@core/window/debugger';
import {EditorEvents, type EditorState} from '../../state/EditorState';

interface IListLike { addListItem(item: IWindow): IWindow; destroyListItems(): void; }
interface IFinder { findChildByName(n: string): IWindow | null; }
interface IToggle { isSelected: boolean; addEventListener(type: string, cb: () => void): void; }

const SELECTED_COLOR = 0xffef9a9a; // Glaze's pink selection tint
const ROW_HEIGHT = 20;
const INDENT = 14;

/**
 * WindowHierarchy — the "Hierarchy View" tree as Habbo widget rows.
 *
 * Each node becomes a row (`region`) with a visibility `checkbox`, a collapse
 * twisty, and a `name [type]` label, indented by depth. Clicking a row selects
 * the node (pink highlight, à la Glaze); the checkbox toggles `visible`; the
 * twisty collapses/expands. All Habbo widgets — no DOM.
 */
export class WindowHierarchy
{
    private readonly _state: EditorState;
    private readonly _list: IListLike;
    private readonly _wm: EditorState['runtime']['windowManager'];
    private readonly _rowByWindow: Map<IWindow, IWindow> = new Map();
    private readonly _collapsed: Set<IWindow> = new Set();
    private _rebuildScheduled = false;

    public constructor(state: EditorState, list: IWindow)
    {
        this._state = state;
        this._wm = state.runtime.windowManager;
        this._list = list as unknown as IListLike;

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

        const root = this._state.rootWindow;

        if(!root || root.disposed)
        {
            return;
        }

        this.appendNode(WindowTreeInspector.snapshot(root), 0);
        this._refreshSelection();
    };

    private appendNode(node: IWindowDebugNode, depth: number): void
    {
        const row = this._wm.buildWidgetLayout('glaze_hierarchy_row_xml');

        if(!row)
        {
            return;
        }

        const finder = row as unknown as IFinder;
        const rc = row as unknown as WindowController;
        const hasChildren = node.children.length > 0;
        const collapsed = this._collapsed.has(node.window);
        const shift = depth * INDENT;

        this.setX(finder.findChildByName('glaze_row_vis'), 4 + shift);
        this.setX(finder.findChildByName('glaze_row_twisty'), 26 + shift);

        const labelEl = finder.findChildByName('glaze_row_label') as unknown as (WindowController & { text: string }) | null;

        if(labelEl)
        {
            const name = node.name ? `${node.name} ` : '';
            const tags = this._state.showTags && node.tags.length > 0 ? `  {${node.tags.join(',')}}` : '';

            labelEl.text = `${name}[${node.typeName}]${tags}`;
            labelEl.x = 42 + shift;
        }

        const arrow = finder.findChildByName('glaze_row_arrow') as unknown as { text: string } | null;

        if(arrow)
        {
            arrow.text = hasChildren ? (collapsed ? '▸' : '▾') : '';
        }

        // Visibility checkbox.
        const vis = finder.findChildByName('glaze_row_vis') as unknown as IToggle | null;

        if(vis)
        {
            vis.isSelected = node.visible;
            vis.addEventListener('WE_SELECTED', () => { this.setVisible(node.window, true); });
            vis.addEventListener('WE_UNSELECTED', () => { this.setVisible(node.window, false); });
        }

        // Twisty collapses/expands (its own procedure, so it doesn't select).
        const twisty = finder.findChildByName('glaze_row_twisty') as unknown as WindowController | null;

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
            if(event.type === WindowMouseEvent.CLICK)
            {
                this._state.select(node.window);
            }
        };

        this._list.addListItem(row);
        this._rowByWindow.set(node.window, row);

        if(hasChildren && !collapsed)
        {
            for(const child of node.children)
            {
                this.appendNode(child, depth + 1);
            }
        }
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
        for(const [win, row] of this._rowByWindow)
        {
            const rc = row as unknown as WindowController;
            const selected = win === this._state.selected;

            rc.background = selected;
            rc.color = selected ? SELECTED_COLOR : 0x00ffffff;
        }
    };

    public dispose(): void
    {
        this._state.events.off(EditorEvents.LAYOUT_CHANGED, this._scheduleRebuild);
        this._state.events.off(EditorEvents.TREE_CHANGED, this._scheduleRebuild);
        this._state.events.off(EditorEvents.DEBUG_CHANGED, this._scheduleRebuild);
        this._state.events.off(EditorEvents.SELECTION_CHANGED, this._refreshSelection);
        this._list.destroyListItems();
        this._rowByWindow.clear();
    }
}

import {EventEmitter} from 'eventemitter3';
import type {IWindow} from '@core/window/IWindow';
import type {WindowController} from '@core/window/WindowController';
import type {IGlazeRuntime} from '../boot/GlazeBoot';
import {VariablesModel} from './VariablesModel';
import {EditorHistory} from './EditorHistory';

export type AlignEdge = 'left' | 'hcenter' | 'right' | 'top' | 'vmiddle' | 'bottom';

/**
 * Editor state events.
 *
 * - `layoutChanged`     — the open layout's root window was replaced.
 * - `selectionChanged`  — the selected node changed (rebuild the inspector).
 * - `treeChanged`       — the tree structure or a node's geometry/label changed
 *                          (refresh the hierarchy view), without changing selection.
 */
export const EditorEvents =
    {
        LAYOUT_CHANGED: 'layoutChanged',
        SELECTION_CHANGED: 'selectionChanged',
        TREE_CHANGED: 'treeChanged',
        GEOMETRY_CHANGED: 'geometryChanged',
        DEBUG_CHANGED: 'debugChanged'
    } as const;

/**
 * EditorState — the single source of truth for what is open and selected.
 *
 * Holds the runtime, the currently open layout's root window, and the selected
 * node. Panels subscribe to {@link events} and never talk to each other directly.
 */
export class EditorState
{
    public readonly events = new EventEmitter();

    /** Debug view toggles (bottom bar) + live mouse position over the canvas. */
    public showTags = false;
    public debugRects = false;
    public showScaler = true;
    public readonly mouse = {x: 0, y: 0};

    /** Canvas background behind the edited layout (Background / Canvas Back Color / Load Image). */
    public readonly canvasBg = {mode: 'checker' as 'checker' | 'solid', color: 0xffe7e7f4, image: null as HTMLImageElement | null};

    /** True while a modal popup (e.g. Image Gallery) is open, so the centre picker stands down. */
    public modalOpen = false;

    private readonly _runtime: IGlazeRuntime;
    private readonly _history: EditorHistory;
    private _rootWindow: IWindow | null = null;
    private _selected: IWindow | null = null;
    private _currentLayoutName: string | null = null;
    private _variables: VariablesModel | null = null;
    private _snap: number = 8;

    public constructor(runtime: IGlazeRuntime)
    {
        this._runtime = runtime;
        this._history = new EditorHistory(this);
    }

    public get runtime(): IGlazeRuntime
    {
        return this._runtime;
    }

    public get rootWindow(): IWindow | null
    {
        return this._rootWindow;
    }

    public get selected(): IWindow | null
    {
        return this._selected;
    }

    public get currentLayoutName(): string | null
    {
        return this._currentLayoutName;
    }

    /** The source-XML `<variables>` model for the open layout (edited off the XML). */
    public get variables(): VariablesModel | null
    {
        return this._variables;
    }

    /** Grid snap size in pixels for canvas manipulation (0 = off). */
    public get snap(): number
    {
        return this._snap;
    }

    public set snap(value: number)
    {
        this._snap = Math.max(0, Math.floor(value) || 0);
    }

    /** Snaps a value to the grid, or returns it unchanged when snapping is off. */
    public snapValue(value: number): number
    {
        return this._snap > 0 ? Math.round(value / this._snap) * this._snap : Math.round(value);
    }

    /** All registered layout names, sorted. */
    public getLayoutNames(): string[]
    {
        return this._runtime.windowManager.getRegisteredWidgetLayoutNames().slice().sort();
    }

    /**
     * Builds a registered layout (destroying any previous one) and selects its root.
     */
    public openLayout(name: string): void
    {
        this.destroyRoot();

        const wm = this._runtime.windowManager;
        const built = wm.buildWidgetLayout(name);

        if(!built)
        {
            return;
        }

        // `buildFromXML` returns the root detached (parent null, faithful to AS3),
        // so the caller must place it. Attach it to the layer-1 desktop: without a
        // parent, container-rooted layouts have no graphic context and never render
        // (leaving the previous layout's stale pixels on screen), and `center()` —
        // which is a no-op when parentless — can't position it.
        const desktop = wm.getDesktop(1);

        if(desktop)
        {
            (desktop as unknown as { addChild(child: IWindow): IWindow }).addChild(built);
        }

        built.center();

        this._rootWindow = built;
        this._currentLayoutName = name;
        this._selected = built;
        this._variables = new VariablesModel(this._runtime.layoutXml.get(name) ?? '');

        // Opening a fresh layout starts a clean history; a restore (undo/redo)
        // re-enters here but is guarded inside so the stacks survive.
        this._history.onLayoutOpened();

        this.events.emit(EditorEvents.LAYOUT_CHANGED, built);
        this.events.emit(EditorEvents.SELECTION_CHANGED, built);
    }

    /**
     * Records a restore point before a mutation (undo). A non-null `coalesceKey`
     * collapses repeated same-key pushes into one step (e.g. a field typed
     * character-by-character, or a held nudge key).
     */
    public pushHistory(coalesceKey: string | null = null): void
    {
        this._history.push(coalesceKey);
    }

    public undo(): void
    {
        this._history.undo();
    }

    public redo(): void
    {
        this._history.redo();
    }

    public get canUndo(): boolean
    {
        return this._history.canUndo;
    }

    public get canRedo(): boolean
    {
        return this._history.canRedo;
    }

    /** Aligns the selected window against its parent's edges/center. */
    public alignSelected(edge: AlignEdge): void
    {
        const win = this._selected as unknown as WindowController | null;

        if(!win || win.disposed || !win.parent)
        {
            return;
        }

        const parent = win.parent;
        let x = win.x;
        let y = win.y;

        this.pushHistory();

        switch(edge)
        {
            case 'left': x = 0; break;
            case 'hcenter': x = Math.round((parent.width - win.width) / 2); break;
            case 'right': x = parent.width - win.width; break;
            case 'top': y = 0; break;
            case 'vmiddle': y = Math.round((parent.height - win.height) / 2); break;
            case 'bottom': y = parent.height - win.height; break;
        }

        win.rectangle = {x, y, width: win.width, height: win.height};
        this.notifyGeometryChanged();
    }

    /** Re-centers the open root window within the canvas. */
    public centerRoot(): void
    {
        if(this._rootWindow && !this._rootWindow.disposed)
        {
            this.pushHistory();
            this._rootWindow.center();
            this.notifyGeometryChanged();
        }
    }

    public select(window: IWindow | null): void
    {
        if(this._selected === window)
        {
            return;
        }

        this._selected = window;
        this.events.emit(EditorEvents.SELECTION_CHANGED, window);
    }

    /** Signals that a node's geometry, label or structure changed. */
    public notifyTreeChanged(): void
    {
        this.events.emit(EditorEvents.TREE_CHANGED);
    }

    /**
     * Signals the selected node's geometry changed via the canvas (drag/resize/
     * nudge/align) — lets the inspector refresh its x/y/w/h fields in place
     * without a full rebuild (which would steal focus while typing). Also
     * refreshes the hierarchy size labels.
     */
    public notifyGeometryChanged(): void
    {
        this.events.emit(EditorEvents.GEOMETRY_CHANGED);
        this.events.emit(EditorEvents.TREE_CHANGED);
    }

    /** Signals a change to the debug view toggles (Show Tags / Debug Rects / …). */
    public notifyDebugChanged(): void
    {
        this.events.emit(EditorEvents.DEBUG_CHANGED);
    }

    private destroyRoot(): void
    {
        if(this._rootWindow && !this._rootWindow.disposed)
        {
            this._rootWindow.destroy();
        }

        this._rootWindow = null;
        this._selected = null;
    }

    public dispose(): void
    {
        this.destroyRoot();
        this.events.removeAllListeners();
    }
}

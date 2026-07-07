import {Helium} from 'helium-engine';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IWindowDebugNode} from '@core/window/debugger';
import {SkinPreviewRenderer, WindowTreeInspector} from '@core/window/debugger';
import {TYPE_CODE_TO_NAME, WindowType} from '@core/window/enum/WindowType';
import {Logger} from '@core/utils/Logger';
import type {IElementDescriptor} from '@habbo/window/IElementDescriptor';

const log = Logger.getLogger('WindowDebugger');

/**
 * Dev-only visual debugger overlay (helium-client/src/debugger).
 *
 * Entirely opt-in: installWindowDebugger() only adds one small floating
 * toggle button (plus a Ctrl+Shift+D hotkey as a bonus shortcut — some
 * browsers reserve that combo, e.g. Firefox's "Bookmark All Tabs", and
 * can swallow it before page JS ever sees it, so the button is the
 * reliable path). Lets you browse every registered widget layout and
 * skin/style combination, spawn a layout as a real live window (same
 * buildWidgetLayout() path production uses, so it's fully interactive),
 * and inspect its component tree with on-canvas highlight boxes.
 * No AS3 equivalent.
 */

const HOTKEY_CODE = 'KeyD';
const CASCADE_OFFSET = 24;
const CONTEXT_LAYER_COUNT = 4;

interface IOpenWindowEntry
{
    id: number;
    label: string;
    window: IWindow;
}

let nextOpenId = 1;
let stylesInjected = false;

export function installWindowDebugger(canvas: HTMLCanvasElement): () => void
{
    let panel: WindowDebuggerPanel | null = null;

    const toggle = (): void =>
    {
        if(panel)
        {
            panel.dispose();
            panel = null;
        }
        else
        {
            panel = new WindowDebuggerPanel(canvas, () =>
            {
                panel = null;
                toggleButton.classList.remove('hwd-toggle-active');
            });
        }

        toggleButton.classList.toggle('hwd-toggle-active', panel !== null);
    };

    const onKeyDown = (event: KeyboardEvent): void =>
    {
        if(!event.ctrlKey || !event.shiftKey || event.code !== HOTKEY_CODE) return;

        event.preventDefault();
        toggle();
    };

    window.addEventListener('keydown', onKeyDown);

    const toggleButton = createToggleButton(toggle);

    return () =>
    {
        window.removeEventListener('keydown', onKeyDown);
        toggleButton.remove();
        panel?.dispose();
        panel = null;
    };
}

function createToggleButton(onToggle: () => void): HTMLButtonElement
{
    injectStyles();

    const button = document.createElement('button');

    button.className = 'hwd-toggle-btn';
    button.textContent = '🐞';
    button.title = 'Window Debugger (Ctrl+Shift+D)';
    button.addEventListener('click', onToggle);
    document.body.appendChild(button);

    return button;
}

class WindowDebuggerPanel
{
    private readonly _canvas: HTMLCanvasElement;
    private readonly _onClosed: () => void;
    private readonly _root: HTMLDivElement;
    private readonly _listEl: HTMLDivElement;
    private readonly _detailEl: HTMLDivElement;
    private readonly _openListEl: HTMLDivElement;
    private readonly _treeEl: HTMLDivElement;
    private readonly _selectedHighlight: HTMLDivElement;
    private readonly _hoverHighlight: HTMLDivElement;
    private readonly _tabButtons: Record<'layouts' | 'skins', HTMLButtonElement>;
    private readonly _pickBtn: HTMLButtonElement;

    private _activeTab: 'layouts' | 'skins' = 'layouts';
    private _openWindows: IOpenWindowEntry[] = [];
    private _selectedWindow: IWindow | null = null;
    private _selectedNodeWindow: IWindow | null = null;
    private _pickModeActive: boolean = false;
    private _rafId: number = 0;
    private _lastTreeRefresh: number = 0;

    private readonly pickListener = (event: MouseEvent): void => this.onCanvasPick(event);
    private readonly hoverPickListener = (event: MouseEvent): void => this.onCanvasHoverPick(event);
    private readonly pickEscListener = (event: KeyboardEvent): void =>
    {
        if(event.code === 'Escape') this.stopPickMode();
    };

    public constructor(canvas: HTMLCanvasElement, onClosed: () => void)
    {
        this._canvas = canvas;
        this._onClosed = onClosed;

        injectStyles();

        this._root = document.createElement('div');
        this._root.className = 'hwd-root';

        const header = document.createElement('div');

        header.className = 'hwd-header';
        header.innerHTML = '<span>Window Debugger</span>';
        header.addEventListener('mousedown', (event) => this.startDrag(event, this._root));

        const closeBtn = document.createElement('button');

        closeBtn.className = 'hwd-close';
        closeBtn.textContent = '×';
        closeBtn.title = 'Close (Ctrl+Shift+D)';
        closeBtn.addEventListener('click', () => this.dispose());
        header.appendChild(closeBtn);

        const toolbar = document.createElement('div');

        toolbar.className = 'hwd-toolbar';

        this._pickBtn = document.createElement('button');
        this._pickBtn.className = 'hwd-pick-btn';
        this._pickBtn.addEventListener('click', () => this.togglePickMode());
        toolbar.appendChild(this._pickBtn);

        const tabs = document.createElement('div');

        tabs.className = 'hwd-tabs';

        const layoutsTabBtn = document.createElement('button');

        layoutsTabBtn.textContent = 'Layouts';
        layoutsTabBtn.addEventListener('click', () => this.setTab('layouts'));

        const skinsTabBtn = document.createElement('button');

        skinsTabBtn.textContent = 'Skins';
        skinsTabBtn.addEventListener('click', () => this.setTab('skins'));

        tabs.appendChild(layoutsTabBtn);
        tabs.appendChild(skinsTabBtn);

        this._tabButtons = {layouts: layoutsTabBtn, skins: skinsTabBtn};

        const body = document.createElement('div');

        body.className = 'hwd-body';

        this._listEl = document.createElement('div');
        this._listEl.className = 'hwd-list';

        this._detailEl = document.createElement('div');
        this._detailEl.className = 'hwd-detail';

        this._openListEl = document.createElement('div');
        this._openListEl.className = 'hwd-open-list';

        this._treeEl = document.createElement('div');
        this._treeEl.className = 'hwd-tree';

        this._detailEl.appendChild(this._openListEl);
        this._detailEl.appendChild(this._treeEl);

        body.appendChild(this._listEl);
        body.appendChild(this._detailEl);

        this._root.appendChild(header);
        this._root.appendChild(toolbar);
        this._root.appendChild(tabs);
        this._root.appendChild(body);

        document.body.appendChild(this._root);

        this._selectedHighlight = document.createElement('div');
        this._selectedHighlight.className = 'hwd-highlight hwd-highlight-selected';
        document.body.appendChild(this._selectedHighlight);

        this._hoverHighlight = document.createElement('div');
        this._hoverHighlight.className = 'hwd-highlight hwd-highlight-hover';
        document.body.appendChild(this._hoverHighlight);

        this.updatePickButton();
        this.setTab('layouts');
        this.renderOpenList();
        this.loop();
    }

    private startDrag(event: MouseEvent, target: HTMLElement): void
    {
        if((event.target as HTMLElement).closest('.hwd-close')) return;

        event.preventDefault();

        const rect = target.getBoundingClientRect();
        const offsetX = event.clientX - rect.left;
        const offsetY = event.clientY - rect.top;

        target.style.left = `${rect.left}px`;
        target.style.top = `${rect.top}px`;
        target.style.right = 'auto';

        const onMove = (moveEvent: MouseEvent): void =>
        {
            const maxLeft = window.innerWidth - target.offsetWidth;
            const maxTop = window.innerHeight - target.offsetHeight;

            target.style.left = `${Math.min(Math.max(0, moveEvent.clientX - offsetX), Math.max(0, maxLeft))}px`;
            target.style.top = `${Math.min(Math.max(0, moveEvent.clientY - offsetY), Math.max(0, maxTop))}px`;
        };

        const onUp = (): void =>
        {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
        };

        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
    }

    public dispose(): void
    {
        cancelAnimationFrame(this._rafId);

        if(this._pickModeActive)
        {
            this.stopPickMode();
        }

        this._root.remove();
        this._selectedHighlight.remove();
        this._hoverHighlight.remove();
        document.getElementById('hwd-pick-menu')?.remove();
        this._onClosed();
    }

    private setTab(tab: 'layouts' | 'skins'): void
    {
        this._activeTab = tab;

        for(const [name, btn] of Object.entries(this._tabButtons))
        {
            btn.classList.toggle('hwd-tab-active', name === tab);
        }

        if(tab === 'layouts')
        {
            this.renderLayoutsList('');
            this.renderOpenList();

            if(this._selectedWindow)
            {
                this.refreshTree();
            }
        }
        else
        {
            this.renderSkinsList('');
        }
    }

    // ── Layouts tab ──────────────────────────────────────────────────

    private renderLayoutsList(filter: string): void
    {
        const windowManager = Helium.instance.windowManager;
        const names = windowManager.getRegisteredWidgetLayoutNames().sort();

        this._listEl.innerHTML = '';

        const search = document.createElement('input');

        search.type = 'text';
        search.placeholder = `Filter ${names.length} layouts...`;
        search.className = 'hwd-search';
        search.value = filter;
        search.addEventListener('input', () => this.renderLayoutsList(search.value));

        const scroll = document.createElement('div');

        scroll.className = 'hwd-scroll';

        const lower = filter.toLowerCase();

        for(const name of names)
        {
            if(lower && !name.toLowerCase().includes(lower)) continue;

            const row = document.createElement('div');

            row.className = 'hwd-row';
            row.textContent = name;
            row.addEventListener('click', () => this.spawnLayout(name));
            scroll.appendChild(row);
        }

        this._listEl.appendChild(search);
        this._listEl.appendChild(scroll);
    }

    private spawnLayout(name: string): void
    {
        const windowManager = Helium.instance.windowManager;
        const built = windowManager.buildWidgetLayout(name);

        if(!built)
        {
            return;
        }

        built.center();
        built.offset((this._openWindows.length % 10) * CASCADE_OFFSET, (this._openWindows.length % 10) * CASCADE_OFFSET);

        const entry: IOpenWindowEntry = {id: nextOpenId++, label: name, window: built};

        this._openWindows.push(entry);
        this.selectWindow(built);
        this.renderOpenList();
    }

    private renderOpenList(): void
    {
        this._openWindows = this._openWindows.filter(entry => !entry.window.disposed);

        this._openListEl.innerHTML = '';

        if(this._openWindows.length === 0)
        {
            return;
        }

        const heading = document.createElement('div');

        heading.className = 'hwd-heading';
        heading.textContent = `Open (${this._openWindows.length})`;
        this._openListEl.appendChild(heading);

        for(const entry of this._openWindows)
        {
            const row = document.createElement('div');

            row.className = 'hwd-open-row';

            if(entry.window === this._selectedWindow)
            {
                row.classList.add('hwd-row-selected');
            }

            const label = document.createElement('span');

            label.textContent = entry.label;
            label.addEventListener('click', () => this.selectWindow(entry.window));

            const closeBtn = document.createElement('button');

            closeBtn.textContent = '×';
            closeBtn.addEventListener('click', (event) =>
            {
                event.stopPropagation();
                entry.window.destroy();

                if(this._selectedWindow === entry.window)
                {
                    this._selectedWindow = null;
                    this._treeEl.innerHTML = '';
                }

                this.renderOpenList();
            });

            row.appendChild(label);
            row.appendChild(closeBtn);
            this._openListEl.appendChild(row);
        }
    }

    // ── Tree inspector ───────────────────────────────────────────────

    private selectWindow(window: IWindow): void
    {
        this._selectedWindow = window;
        this._selectedNodeWindow = null;
        this.refreshTree();
        this.renderOpenList();
    }

    private refreshTree(): void
    {
        this._treeEl.innerHTML = '';

        if(!this._selectedWindow || this._selectedWindow.disposed)
        {
            this._selectedWindow = null;

            return;
        }

        const snapshot = WindowTreeInspector.snapshot(this._selectedWindow);
        let overlaps: IOverlapWarning[] | null = null;

        try
        {
            overlaps = findOverlaps(snapshot);
        }
        catch (error)
        {
            log.warn('Overlap detection failed', error);
        }

        const overlappingWindows = new Set<IWindow>();

        for(const overlap of overlaps ?? [])
        {
            overlappingWindows.add(overlap.a.window);
            overlappingWindows.add(overlap.b.window);
        }

        const toolbar = document.createElement('div');

        toolbar.className = 'hwd-tree-toolbar';

        const copyBtn = document.createElement('button');

        copyBtn.className = 'hwd-copy-btn';
        copyBtn.textContent = 'Copy tree as text';
        copyBtn.addEventListener('click', () =>
        {
            let report: string;

            try
            {
                report = buildTreeReport(snapshot);
            }
            catch (error)
            {
                log.warn('Failed to build tree report', error);
                copyBtn.textContent = 'Copy failed';

                return;
            }

            navigator.clipboard.writeText(report).then(() =>
            {
                copyBtn.textContent = 'Copied!';
                setTimeout(() => { copyBtn.textContent = 'Copy tree as text'; }, 1200);
            }).catch(() => { copyBtn.textContent = 'Copy failed'; });
        });
        toolbar.appendChild(copyBtn);

        if(overlaps === null)
        {
            const notice = document.createElement('span');

            notice.className = 'hwd-overlap-count';
            notice.textContent = 'Overlap check skipped (tree too large)';
            toolbar.appendChild(notice);
        }
        else if(overlaps.length > 0)
        {
            const warning = document.createElement('span');

            warning.className = 'hwd-overlap-count';
            warning.textContent = `⚠ ${overlaps.length} overlap${overlaps.length > 1 ? 's' : ''}`;
            toolbar.appendChild(warning);
        }

        this._treeEl.appendChild(toolbar);

        const list = document.createElement('div');

        list.className = 'hwd-tree-list';
        this.appendTreeNode(list, snapshot, 0, overlappingWindows);
        this._treeEl.appendChild(list);

        if(this._selectedNodeWindow)
        {
            const selectedNode = findNodeByWindow(snapshot, this._selectedNodeWindow);

            if(selectedNode)
            {
                this.showDetailPanel(selectedNode);
                this.positionHighlight(this._selectedHighlight, selectedNode.globalRect);
            }
            else
            {
                this._selectedNodeWindow = null;
                this.hideHighlight(this._selectedHighlight);
            }
        }
    }

    private appendTreeNode(parentEl: HTMLElement, node: IWindowDebugNode, depth: number, overlappingWindows: Set<IWindow>): void
    {
        const row = document.createElement('div');
        const isOverlapping = overlappingWindows.has(node.window);

        row.className = 'hwd-tree-row';
        row.style.paddingLeft = `${depth * 14}px`;
        row.textContent = `${isOverlapping ? '⚠ ' : ''}${node.typeName} "${node.name}" (${node.rect.width}x${node.rect.height})`;

        if(!node.visible)
        {
            row.classList.add('hwd-tree-row-hidden');
        }

        if(isOverlapping)
        {
            row.classList.add('hwd-tree-row-overlap');
        }

        row.addEventListener('click', (event) =>
        {
            event.stopPropagation();
            this._selectedNodeWindow = node.window;
            this.showDetailPanel(node);
            this.positionHighlight(this._selectedHighlight, node.globalRect);
        });

        row.addEventListener('mouseenter', () => this.positionHighlight(this._hoverHighlight, node.globalRect));
        row.addEventListener('mouseleave', () => this.hideHighlight(this._hoverHighlight));

        parentEl.appendChild(row);

        for(const child of node.children)
        {
            this.appendTreeNode(parentEl, child, depth + 1, overlappingWindows);
        }
    }

    private showDetailPanel(node: IWindowDebugNode): void
    {
        const existing = this._treeEl.querySelector('.hwd-node-detail');

        existing?.remove();

        const detail = document.createElement('pre');

        detail.className = 'hwd-node-detail';
        detail.textContent = [
            `name: ${node.name}`,
            `type: ${node.typeName} (${node.type})`,
            `style: ${node.style}  state: ${node.state}  param: ${node.param}`,
            `rect: ${node.rect.x}, ${node.rect.y}, ${node.rect.width}x${node.rect.height}`,
            `dynamicStyle: ${node.dynamicStyle || '(none)'}`,
            `tags: ${node.tags.join(', ') || '(none)'}`,
        ].join('\n');

        this._treeEl.insertBefore(detail, this._treeEl.firstChild);
    }

    // ── Pick mode (click any live window on screen to select it) ─────
    // Always available from the toolbar, independent of tab or whether
    // anything is already selected/open — this is the primary way to
    // inspect windows the app itself created (toolbar, room UI, ...).

    private updatePickButton(): void
    {
        this._pickBtn.textContent = this._pickModeActive ? 'Click anywhere to pick... (Esc to cancel)' : 'Pick element on screen';
        this._pickBtn.classList.toggle('hwd-pick-btn-active', this._pickModeActive);
    }

    private togglePickMode(): void
    {
        if(this._pickModeActive)
        {
            this.stopPickMode();

            return;
        }

        this._pickModeActive = true;
        this._canvas.addEventListener('mousedown', this.pickListener, {capture: true});
        this._canvas.addEventListener('mousemove', this.hoverPickListener, {capture: true});
        window.addEventListener('keydown', this.pickEscListener);
        this.updatePickButton();
    }

    private stopPickMode(): void
    {
        this._pickModeActive = false;
        this._canvas.removeEventListener('mousedown', this.pickListener, {capture: true});
        this._canvas.removeEventListener('mousemove', this.hoverPickListener, {capture: true});
        window.removeEventListener('keydown', this.pickEscListener);
        this.hideHighlight(this._hoverHighlight);
        this.updatePickButton();
    }

    private topWindowAtEvent(event: MouseEvent): IWindow | null
    {
        const rect = this._canvas.getBoundingClientRect();

        return Helium.instance.windowManager.findWindowAtPoint(event.clientX - rect.left, event.clientY - rect.top);
    }

    // findWindowAtPoint() applies production hit-testing rules (only
    // INPUT_EVENT_PROCESSOR windows are returned, first match per layer
    // wins) — great for real gameplay, but it means a full-screen window
    // like the room's canvas wrapper always "wins" and you can never pick
    // whatever's layered behind/around it. This collects every window
    // whose bounds actually contain the point, deepest/topmost first, so
    // the picker can offer all of them.
    private windowsAtEvent(event: MouseEvent): IWindow[]
    {
        const rect = this._canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const windowManager = Helium.instance.windowManager;
        const matches: IWindow[] = [];

        for(let layer = CONTEXT_LAYER_COUNT - 1; layer >= 0; layer--)
        {
            const desktop = windowManager.getDesktop(layer);

            if(desktop) this.collectWindowsAtPoint(desktop, x, y, matches);
        }

        return matches;
    }

    private collectWindowsAtPoint(window: IWindow, x: number, y: number, out: IWindow[]): void
    {
        if(!window.visible) return;

        const container = window as unknown as IWindowContainer;

        if(typeof container.numChildren === 'number')
        {
            for(let i = container.numChildren - 1; i >= 0; i--)
            {
                const child = container.getChildAt(i);

                if(child) this.collectWindowsAtPoint(child, x, y, out);
            }
        }

        const rect = {x: 0, y: 0, width: 0, height: 0};

        window.getGlobalRectangle(rect);

        if(x >= rect.x && x < rect.x + rect.width && y >= rect.y && y < rect.y + rect.height)
        {
            out.push(window);
        }
    }

    private onCanvasHoverPick(event: MouseEvent): void
    {
        const hit = this.topWindowAtEvent(event);

        if(!hit)
        {
            this.hideHighlight(this._hoverHighlight);

            return;
        }

        const globalRect = {x: 0, y: 0, width: 0, height: 0};

        hit.getGlobalRectangle(globalRect);
        this.positionHighlight(this._hoverHighlight, globalRect);
    }

    private onCanvasPick(event: MouseEvent): void
    {
        event.preventDefault();
        event.stopImmediatePropagation();

        const matches = this.windowsAtEvent(event);

        this.stopPickMode();

        if(matches.length === 0) return;

        if(matches.length === 1)
        {
            this.pickWindow(matches[0]);

            return;
        }

        this.showPickMenu(matches, event.clientX, event.clientY);
    }

    private pickWindow(hit: IWindow): void
    {
        if(!this._openWindows.some(entry => entry.window === hit))
        {
            this._openWindows.push({id: nextOpenId++, label: hit.name || hit.caption || '(unnamed)', window: hit});
        }

        this.setTab('layouts');
        this.selectWindow(hit);
    }

    private showPickMenu(matches: IWindow[], clientX: number, clientY: number): void
    {
        document.getElementById('hwd-pick-menu')?.remove();

        const menu = document.createElement('div');

        menu.id = 'hwd-pick-menu';
        menu.className = 'hwd-pick-menu';
        menu.style.left = `${clientX}px`;
        menu.style.top = `${clientY}px`;

        const heading = document.createElement('div');

        heading.className = 'hwd-pick-menu-heading';
        heading.textContent = `${matches.length} windows here — pick one:`;
        heading.addEventListener('mousedown', (event) => this.startDrag(event, menu));
        menu.appendChild(heading);

        for(const match of matches)
        {
            const row = document.createElement('div');

            row.className = 'hwd-pick-menu-row';
            row.textContent = `${TYPE_CODE_TO_NAME[match.type] ?? match.type} "${match.name || match.caption || '(unnamed)'}"`;

            row.addEventListener('mouseenter', () =>
            {
                const rect = {x: 0, y: 0, width: 0, height: 0};

                match.getGlobalRectangle(rect);
                this.positionHighlight(this._hoverHighlight, rect);
            });

            row.addEventListener('click', (event) =>
            {
                event.stopPropagation();
                menu.remove();
                this.hideHighlight(this._hoverHighlight);
                this.pickWindow(match);
            });

            menu.appendChild(row);
        }

        document.body.appendChild(menu);

        const margin = 8;
        const maxLeft = Math.max(margin, window.innerWidth - menu.offsetWidth - margin);
        const maxTop = Math.max(margin, window.innerHeight - menu.offsetHeight - margin);

        menu.style.left = `${Math.min(clientX, maxLeft)}px`;
        menu.style.top = `${Math.min(clientY, maxTop)}px`;

        const closeOnClickAway = (event: MouseEvent): void =>
        {
            if(!menu.contains(event.target as Node))
            {
                menu.remove();
                document.removeEventListener('mousedown', closeOnClickAway, true);
            }
        };

        // Deferred so the click that opened the menu doesn't immediately close it.
        setTimeout(() => document.addEventListener('mousedown', closeOnClickAway, true), 0);
    }

    // ── Skins tab ────────────────────────────────────────────────────

    private renderSkinsList(filter: string): void
    {
        const windowManager = Helium.instance.windowManager;
        const descriptors = [...windowManager.elementRegistry.getAllDescriptors()]
            .sort((a, b) => (a.type + a.style).localeCompare(b.type + b.style));

        this._listEl.innerHTML = '';

        const search = document.createElement('input');

        search.type = 'text';
        search.placeholder = `Filter ${descriptors.length} type/style pairs...`;
        search.className = 'hwd-search';
        search.value = filter;
        search.addEventListener('input', () => this.renderSkinsList(search.value));

        const scroll = document.createElement('div');

        scroll.className = 'hwd-scroll';

        const lower = filter.toLowerCase();

        for(const descriptor of descriptors)
        {
            const label = `${descriptor.type} / style ${descriptor.style} → ${descriptor.asset || '(no skin)'}`;

            if(lower && !label.toLowerCase().includes(lower)) continue;

            const row = document.createElement('div');

            row.className = 'hwd-row';
            row.textContent = label;
            row.addEventListener('click', () => this.previewSkin(descriptor));
            scroll.appendChild(row);
        }

        this._listEl.appendChild(search);
        this._listEl.appendChild(scroll);
    }

    private previewSkin(descriptor: IElementDescriptor): void
    {
        const windowManager = Helium.instance.windowManager;
        const renderer = windowManager.getRendererByTypeAndStyle(descriptor.typeId, descriptor.style);

        this._treeEl.innerHTML = '';
        this._openListEl.innerHTML = '';

        const heading = document.createElement('div');

        heading.className = 'hwd-heading';
        heading.textContent = `${descriptor.type} / style ${descriptor.style} (${descriptor.asset || 'no skin'})`;
        this._treeEl.appendChild(heading);

        if(!renderer)
        {
            const empty = document.createElement('div');

            empty.textContent = 'No renderer registered for this type/style (skin assets not loaded yet?)';
            this._treeEl.appendChild(empty);

            return;
        }

        const frames = SkinPreviewRenderer.renderStates(renderer);

        if(frames.length === 0)
        {
            const empty = document.createElement('div');

            empty.textContent = 'Renderer has no drawable states.';
            this._treeEl.appendChild(empty);

            return;
        }

        const grid = document.createElement('div');

        grid.className = 'hwd-skin-grid';

        for(const frame of frames)
        {
            const cell = document.createElement('div');

            cell.className = 'hwd-skin-cell';

            const canvasEl = document.createElement('canvas');

            canvasEl.width = frame.canvas.width;
            canvasEl.height = frame.canvas.height;

            const ctx = canvasEl.getContext('2d');

            ctx?.drawImage(frame.canvas, 0, 0);

            const label = document.createElement('div');

            label.textContent = `${frame.stateName} (${frame.canvas.width}x${frame.canvas.height})`;

            cell.appendChild(canvasEl);
            cell.appendChild(label);
            grid.appendChild(cell);
        }

        this._treeEl.appendChild(grid);
    }

    // ── Highlight overlay + refresh loop ──────────────────────────────

    private positionHighlight(el: HTMLDivElement, globalRect: { x: number; y: number; width: number; height: number }): void
    {
        const canvasRect = this._canvas.getBoundingClientRect();

        el.style.display = 'block';
        el.style.left = `${canvasRect.left + globalRect.x}px`;
        el.style.top = `${canvasRect.top + globalRect.y}px`;
        el.style.width = `${globalRect.width}px`;
        el.style.height = `${globalRect.height}px`;
    }

    private hideHighlight(el: HTMLDivElement): void
    {
        el.style.display = 'none';
    }

    private loop(): void
    {
        this._rafId = requestAnimationFrame(() => this.loop());

        if(this._selectedWindow)
        {
            if(this._selectedWindow.disposed)
            {
                this._selectedWindow = null;
                this.hideHighlight(this._selectedHighlight);
                this.renderOpenList();
            }
            else
            {
                const rect = {x: 0, y: 0, width: 0, height: 0};

                this._selectedWindow.getGlobalRectangle(rect);
                this.positionHighlight(this._selectedHighlight, rect);
            }
        }

        const now = performance.now();

        if(now - this._lastTreeRefresh > 1000)
        {
            this._lastTreeRefresh = now;

            if(this._activeTab === 'layouts')
            {
                this.renderOpenList();

                if(this._selectedWindow && !this._pickModeActive)
                {
                    this.refreshTree();
                }
            }
        }
    }
}

function findNodeByWindow(node: IWindowDebugNode, window: IWindow): IWindowDebugNode | null
{
    if(node.window === window)
    {
        return node;
    }

    for(const child of node.children)
    {
        const found = findNodeByWindow(child, window);

        if(found) return found;
    }

    return null;
}

const TEXT_LIKE_TYPES = new Set<number>([
    WindowType.TEXT,
    WindowType.LABEL,
    WindowType.LINK,
    WindowType.FORMATTED_TEXT,
    WindowType.TEXTFIELD,
    WindowType.PASSWORD,
    WindowType.HTML,
]);

// Best-effort check for "does this window actually draw pixels", reusing
// the same signals WindowComposite itself draws from (background fill,
// bitmap wrapper types, text content, or a bound skin renderer for its
// type+style) — not a guess, but it can still miss dynamic/animated
// content that isn't reflected in a single snapshot.
// Content-shape check only — does NOT account for a hidden ancestor
// suppressing this node; findOverlaps() tracks effective (ancestor-aware)
// visibility separately, since a node's own `visible` flag says nothing
// about whether an invisible parent is hiding it from the composite.
function hasVisualContent(node: IWindowDebugNode): boolean
{
    if(node.rect.width <= 0 || node.rect.height <= 0) return false;

    const window = node.window;

    if(window.background) return true;

    if(window.type === WindowType.BITMAP_WRAPPER || window.type === WindowType.STATIC_BITMAP_WRAPPER) return true;

    // Some controllers' caption getter can return non-string (undefined
    // has been observed in the wild) despite the IWindow type contract.
    if(TEXT_LIKE_TYPES.has(window.type) && typeof node.caption === 'string' && node.caption.trim() !== '') return true;

    return Helium.instance.windowManager.getRendererByTypeAndStyle(window.type, window.style) !== null;
}

interface IOverlapWarning
{
    a: IWindowDebugNode;
    b: IWindowDebugNode;
}

// Flags sibling-ish nodes (neither is an ancestor of the other) that both
// draw content and whose *global* rects intersect by more than a couple
// pixels. A child overlapping inside its own parent's bounds is normal
// containment, not a bug, so ancestor/descendant pairs are excluded.
const MIN_OVERLAP_PX = 3;
// The comparison below is O(n^2) over every node in the selected subtree —
// fine for a dialog, not for something like the whole desktop or a room
// list with thousands of entries. Skip rather than freeze the tab.
const MAX_OVERLAP_NODES = 400;

// Returns null when the subtree is too large to check safely.
function findOverlaps(root: IWindowDebugNode): IOverlapWarning[] | null
{
    const flat: Array<{ node: IWindowDebugNode; ancestors: Set<IWindow>; effectivelyVisible: boolean }> = [];

    const walk = (node: IWindowDebugNode, ancestors: Set<IWindow>, parentVisible: boolean): void =>
    {
        const effectivelyVisible = parentVisible && node.visible;

        flat.push({node, ancestors, effectivelyVisible});

        const childAncestors = new Set(ancestors);

        childAncestors.add(node.window);

        for(const child of node.children)
        {
            walk(child, childAncestors, effectivelyVisible);
        }
    };

    walk(root, new Set(), true);

    if(flat.length > MAX_OVERLAP_NODES)
    {
        return null;
    }

    const warnings: IOverlapWarning[] = [];

    for(let i = 0; i < flat.length; i++)
    {
        const a = flat[i];

        if(!a.effectivelyVisible || !hasVisualContent(a.node)) continue;

        for(let j = i + 1; j < flat.length; j++)
        {
            const b = flat[j];

            if(a.ancestors.has(b.node.window) || b.ancestors.has(a.node.window)) continue;
            if(!b.effectivelyVisible || !hasVisualContent(b.node)) continue;

            const overlapW = Math.min(a.node.globalRect.x + a.node.globalRect.width, b.node.globalRect.x + b.node.globalRect.width)
                - Math.max(a.node.globalRect.x, b.node.globalRect.x);
            const overlapH = Math.min(a.node.globalRect.y + a.node.globalRect.height, b.node.globalRect.y + b.node.globalRect.height)
                - Math.max(a.node.globalRect.y, b.node.globalRect.y);

            if(overlapW >= MIN_OVERLAP_PX && overlapH >= MIN_OVERLAP_PX)
            {
                warnings.push({a: a.node, b: b.node});
            }
        }
    }

    return warnings;
}

function formatNodeText(node: IWindowDebugNode, depth: number, overlaps: IOverlapWarning[] | null): string
{
    const indent = '  '.repeat(depth);
    const isInvolved = overlaps?.some(o => o.a.window === node.window || o.b.window === node.window) ?? false;
    const marker = isInvolved ? '  [OVERLAP]' : '';
    const r = node.rect;
    const g = node.globalRect;
    let text = `${indent}${node.typeName} "${node.name}" rect=(${r.x},${r.y},${r.width}x${r.height}) `
        + `global=(${g.x},${g.y},${g.width}x${g.height}) style=${node.style} state=${node.state} `
        + `param=${node.param} visible=${node.visible}${marker}\n`;

    for(const child of node.children)
    {
        text += formatNodeText(child, depth + 1, overlaps);
    }

    return text;
}

function buildTreeReport(root: IWindowDebugNode): string
{
    let overlaps: IOverlapWarning[] | null = null;

    try
    {
        overlaps = findOverlaps(root);
    }
    catch (error)
    {
        log.warn('Overlap detection failed', error);
    }

    let text = formatNodeText(root, 0, overlaps);

    if(overlaps === null)
    {
        text += '\nOverlap check skipped (tree too large).\n';
    }
    else if(overlaps.length > 0)
    {
        text += `\nOverlap warnings (${overlaps.length}):\n`;

        for(const overlap of overlaps)
        {
            text += `  - "${overlap.a.name}" (${overlap.a.typeName}) overlaps "${overlap.b.name}" (${overlap.b.typeName})\n`;
        }
    }

    return text;
}

function injectStyles(): void
{
    if(stylesInjected) return;

    stylesInjected = true;

    const style = document.createElement('style');

    style.textContent = `
.hwd-toggle-btn {
    position: fixed;
    bottom: 16px;
    right: 16px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #2a2a2a;
    border: 1px solid #555;
    color: #fff;
    font-size: 18px;
    line-height: 1;
    cursor: pointer;
    z-index: 999997;
    box-shadow: 0 2px 10px rgba(0,0,0,0.5);
}
.hwd-toggle-btn:hover { background: #3a3a3a; border-color: #4a9eff; }
.hwd-toggle-btn.hwd-toggle-active { background: #35506e; border-color: #4a9eff; }
.hwd-root {
    position: fixed;
    top: 12px;
    right: 12px;
    width: 420px;
    max-height: calc(100vh - 84px);
    background: #1e1e1e;
    color: #ddd;
    font: 12px/1.4 monospace;
    border: 1px solid #444;
    border-radius: 6px;
    z-index: 999999;
    display: flex;
    flex-direction: column;
    box-shadow: 0 4px 24px rgba(0,0,0,0.5);
}
.hwd-header { display: flex; justify-content: space-between; align-items: center; padding: 8px 10px; background: #2a2a2a; font-weight: bold; border-bottom: 1px solid #444; border-radius: 6px 6px 0 0; cursor: move; user-select: none; }
.hwd-close { background: none; border: none; color: #ddd; font-size: 16px; cursor: pointer; line-height: 1; }
.hwd-toolbar { padding: 6px 8px; border-bottom: 1px solid #444; }
.hwd-tabs { display: flex; border-bottom: 1px solid #444; }
.hwd-tabs button { flex: 1; background: #262626; color: #aaa; border: none; padding: 6px; cursor: pointer; }
.hwd-tabs button.hwd-tab-active { background: #1e1e1e; color: #fff; border-bottom: 2px solid #4a9eff; }
.hwd-body { display: flex; flex-direction: column; overflow: hidden; flex: 1; }
.hwd-search { margin: 6px; padding: 4px 6px; background: #111; color: #ddd; border: 1px solid #444; border-radius: 4px; }
.hwd-list { display: flex; flex-direction: column; max-height: 220px; }
.hwd-scroll { overflow-y: auto; max-height: 190px; border-top: 1px solid #333; }
.hwd-row { padding: 3px 8px; cursor: pointer; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.hwd-row:hover { background: #2f3d52; }
.hwd-heading { padding: 6px 8px; font-weight: bold; color: #4a9eff; }
.hwd-detail { overflow-y: auto; flex: 1; border-top: 1px solid #333; }
.hwd-open-row { display: flex; justify-content: space-between; padding: 3px 8px; cursor: pointer; }
.hwd-open-row span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.hwd-open-row button { background: none; border: none; color: #e88; cursor: pointer; }
.hwd-row-selected { background: #35506e; }
.hwd-tree { padding: 4px 8px 10px; }
.hwd-pick-btn { width: 100%; margin: 0; padding: 6px; background: #2f3d52; color: #fff; border: 1px solid #4a9eff; border-radius: 4px; cursor: pointer; }
.hwd-pick-btn.hwd-pick-btn-active { background: #ff5050; border-color: #ff5050; }
.hwd-tree-row { cursor: pointer; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.hwd-tree-row:hover { background: #2f3d52; }
.hwd-tree-row-hidden { color: #777; font-style: italic; }
.hwd-tree-row-overlap { color: #ff9d4d; }
.hwd-tree-toolbar { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.hwd-copy-btn { padding: 4px 8px; background: #2a2a2a; color: #ddd; border: 1px solid #555; border-radius: 4px; cursor: pointer; }
.hwd-copy-btn:hover { border-color: #4a9eff; }
.hwd-overlap-count { color: #ff9d4d; font-weight: bold; }
.hwd-node-detail { background: #111; border: 1px solid #333; border-radius: 4px; padding: 6px; margin: 4px 0; white-space: pre-wrap; }
.hwd-skin-grid { display: flex; flex-wrap: wrap; gap: 10px; }
.hwd-skin-cell { text-align: center; }
.hwd-skin-cell canvas { image-rendering: pixelated; background: repeating-conic-gradient(#333 0% 25%, #2a2a2a 0% 50%) 50% / 12px 12px; border: 1px solid #444; }
.hwd-highlight { position: fixed; pointer-events: none; z-index: 999998; display: none; box-sizing: border-box; }
.hwd-highlight-selected { border: 2px solid #ff5050; background: rgba(255,80,80,0.08); }
.hwd-highlight-hover { border: 2px dashed #4a9eff; background: rgba(74,158,255,0.08); }
.hwd-pick-menu { position: fixed; z-index: 1000000; background: #1e1e1e; border: 1px solid #4a9eff; border-radius: 4px; box-shadow: 0 4px 24px rgba(0,0,0,0.5); font: 12px/1.4 monospace; color: #ddd; max-width: 320px; max-height: 260px; overflow-y: auto; }
.hwd-pick-menu-heading { padding: 6px 8px; font-weight: bold; color: #4a9eff; border-bottom: 1px solid #444; white-space: nowrap; cursor: move; user-select: none; }
.hwd-pick-menu-row { padding: 4px 8px; cursor: pointer; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.hwd-pick-menu-row:hover { background: #2f3d52; }
`;
    document.head.appendChild(style);
}

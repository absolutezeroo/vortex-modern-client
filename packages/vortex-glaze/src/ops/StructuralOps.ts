import type {IWindow} from '@core/window/IWindow';
import type {WindowController} from '@core/window/WindowController';
import {TYPE_NAME_TO_CODE} from '@core/window/enum/WindowType';
import type {EditorState} from '../state/EditorState';

/** Window types offered in the "add" palette. */
export const ADDABLE_TYPES = [
    'container',
    'region',
    'text',
    'label',
    'border',
    'button',
    'checkbox',
    'bitmap',
    'itemlist_vertical'
];

interface IContainerLike
{
    numChildren: number;
    getChildAt(index: number): IWindow | null;
    removeChild(child: IWindow): IWindow | null;
    addChildAt(child: IWindow, index: number): IWindow;
    addChild(child: IWindow): IWindow;
}

/**
 * A widget the palette can drop into the tree: the window type plus the geometry,
 * caption and style it should be born with (a `button` with no caption and a
 * 60×30 box is not recognisable as a button).
 */
export interface IWidgetSpec
{
    type: string;
    label: string;
    width: number;
    height: number;
    caption?: string;
    style?: number;
    params?: number;
}

let counter = 1;

/**
 * Structural editing operations on the live window tree. New tooling (no AS3
 * equivalent — Glaze is a separate authoring app), built on the ported engine's
 * own `create` / `clone` / `addChild` / `removeChild` / `destroy` primitives.
 * Each op re-notifies the hierarchy and updates the selection.
 */

/** Creates a child of the given type under the selected node (or the root). */
export function addChildOfType(state: EditorState, typeName: string): void
{
    addWidget(state, {type: typeName, label: typeName, width: 60, height: 30});
}

/**
 * Creates `spec` under the selected node (or the root) and selects it. The new
 * window inherits its parent's style unless the spec names one, which is what
 * keeps a control dropped into an Illumina frame looking Illumina.
 */
export function addWidget(state: EditorState, spec: IWidgetSpec): IWindow | null
{
    const parent = (state.selected ?? state.rootWindow) as IWindow | null;

    if(!parent || parent.disposed)
    {
        return null;
    }

    const type = TYPE_NAME_TO_CODE[spec.type];

    if(type === undefined)
    {
        return null;
    }

    state.pushHistory();

    const target = parent.getLayoutChildTarget();
    const name = `${spec.type}_${counter++}`;
    const created = target.context.create(
        name, spec.caption ?? '', type, spec.style ?? target.style, spec.params ?? 0,
        {x: 0, y: 0, width: spec.width, height: spec.height},
        null, target, 0, null, '', null
    );

    state.notifyTreeChanged();
    state.select(created);

    return created;
}

/** The deletable/clonable part of the selection: live nodes, never the root. */
function editableSelection(state: EditorState): WindowController[]
{
    return state.selection
        .filter((win) => !win.disposed && win !== state.rootWindow)
        .map((win) => win as unknown as WindowController);
}

/** Destroys every selected node (never the root) and selects the last parent. */
export function deleteSelected(state: EditorState): void
{
    const nodes = editableSelection(state);

    if(nodes.length === 0)
    {
        return;
    }

    state.pushHistory();

    let fallback: IWindow | null = null;

    for(const win of nodes)
    {
        if(win.disposed)
        {
            continue; // already gone with an ancestor deleted earlier in this pass
        }

        fallback = win.parent ?? fallback;
        win.destroy();
    }

    state.select(fallback ?? state.rootWindow);
    state.notifyTreeChanged();
}

/** Clones every selected node into its parent, offset by the grid. */
export function cloneSelected(state: EditorState): void
{
    const nodes = editableSelection(state);

    if(nodes.length === 0)
    {
        return;
    }

    state.pushHistory();

    const offset = state.snap || 8;
    const clones: IWindow[] = [];

    for(const win of nodes)
    {
        const parent = win.parent as unknown as IContainerLike | null;

        if(!parent)
        {
            continue;
        }

        const clone = win.clone() as unknown as WindowController;

        parent.addChild(clone);
        clone.rectangle = {x: win.x + offset, y: win.y + offset, width: win.width, height: win.height};
        clones.push(clone as unknown as IWindow);
    }

    state.notifyTreeChanged();

    if(clones.length > 0)
    {
        state.selectMany(clones);
    }
}

/** Moves the selected node up/down among its siblings. */
export function reorderSelected(state: EditorState, delta: number): void
{
    const win = state.selected as IWindow | null;

    if(!win || win.disposed || !win.parent)
    {
        return;
    }

    const parent = win.parent as unknown as IContainerLike;
    let index = -1;

    for(let i = 0; i < parent.numChildren; i++)
    {
        if(parent.getChildAt(i) === win)
        {
            index = i;
            break;
        }
    }

    if(index < 0)
    {
        return;
    }

    const newIndex = Math.max(0, Math.min(parent.numChildren - 1, index + delta));

    if(newIndex === index)
    {
        return;
    }

    state.pushHistory();
    parent.removeChild(win);
    parent.addChildAt(win, newIndex);
    state.notifyTreeChanged();
    state.select(win);
}

/**
 * Converts the selected node to a different window type, preserving geometry,
 * name, style, params and re-parenting its children into the new window.
 */
export function convertSelected(state: EditorState, typeName: string): void
{
    const win = state.selected as unknown as WindowController | null;

    if(!win || win.disposed || (win as unknown as IWindow) === state.rootWindow)
    {
        return;
    }

    const type = TYPE_NAME_TO_CODE[typeName];
    const parent = (win as unknown as IWindow).parent;

    if(type === undefined || !parent)
    {
        return;
    }

    state.pushHistory();

    const target = parent.getLayoutChildTarget();
    const created = target.context.create(
        win.name, win.caption, type, win.style, win.param,
        {x: win.x, y: win.y, width: win.width, height: win.height},
        null, target, win.id, win.tags.slice(), win.dynamicStyle, null
    );

    // Move the original's children into the new window.
    const oldC = win as unknown as IContainerLike;
    const newC = created as unknown as IContainerLike;
    const children: IWindow[] = [];

    for(let i = 0; i < (oldC.numChildren ?? 0); i++)
    {
        const child = oldC.getChildAt(i);

        if(child) children.push(child);
    }

    for(const child of children)
    {
        oldC.removeChild(child);
        newC.addChild(child);
    }

    (created as unknown as WindowController).color = win.color;
    win.destroy();
    state.notifyTreeChanged();
    state.select(created);
}

/** Distributes the selected node's direct children evenly along one axis. */
export function distributeChildren(state: EditorState, axis: 'v' | 'h'): void
{
    const parent = state.selected as unknown as IContainerLike | null;

    if(!parent || typeof parent.numChildren !== 'number')
    {
        return;
    }

    const kids: WindowController[] = [];

    for(let i = 0; i < parent.numChildren; i++)
    {
        const child = parent.getChildAt(i);

        if(child && !child.disposed) kids.push(child as unknown as WindowController);
    }

    if(kids.length < 3)
    {
        return;
    }

    state.pushHistory();

    const key = axis === 'v' ? 'y' : 'x';

    kids.sort((a, b) => a[key] - b[key]);

    const start = kids[0][key];
    const end = kids[kids.length - 1][key];
    const step = (end - start) / (kids.length - 1);

    kids.forEach((k, i) =>
    {
        const pos = Math.round(start + i * step);

        k.rectangle = axis === 'v'
            ? {x: k.x, y: pos, width: k.width, height: k.height}
            : {x: pos, y: k.y, width: k.width, height: k.height};
    });

    state.notifyGeometryChanged();
}

/** Where a dragged hierarchy row lands relative to the row it was dropped on. */
export type DropPosition = 'before' | 'inside' | 'after';

/** True when a window can take children at all (containers, frames, lists…). */
export function canHaveChildren(window: IWindow | null): boolean
{
    if(!window || window.disposed)
    {
        return false;
    }

    const container = window as unknown as Partial<IContainerLike>;

    return typeof container.numChildren === 'number' && typeof container.addChildAt === 'function';
}

function childIndexOf(parent: IWindow, child: IWindow): number
{
    const container = parent as unknown as IContainerLike;

    for(let i = 0; i < container.numChildren; i++)
    {
        if(container.getChildAt(i) === child)
        {
            return i;
        }
    }

    return -1;
}

function isAncestorOf(candidate: IWindow, node: IWindow): boolean
{
    let parent: IWindow | null = node.parent;

    while(parent)
    {
        if(parent === candidate)
        {
            return true;
        }

        parent = parent.parent;
    }

    return false;
}

/**
 * Drops `node` onto `target` — the hierarchy's drag & drop. `inside` appends it
 * to the target's child list; `before`/`after` inserts it beside the target among
 * its siblings. Cycles, no-ops and drops onto the node's own descendants are
 * rejected.
 */
export function dropNode(state: EditorState, node: IWindow, target: IWindow, position: DropPosition): void
{
    if(!node || !target || node === target || node.disposed || target.disposed || node === state.rootWindow)
    {
        return;
    }

    if(isAncestorOf(node, target))
    {
        return;
    }

    if(position === 'inside')
    {
        reparent(state, node, target);

        return;
    }

    const parent = target.parent;

    if(!parent || parent === node)
    {
        return;
    }

    const container = parent.getLayoutChildTarget() as unknown as IContainerLike;
    const sameParent = node.parent === parent;
    let index = childIndexOf(parent, target);

    if(index < 0)
    {
        return;
    }

    if(position === 'after')
    {
        index += 1;
    }

    if(sameParent)
    {
        const current = childIndexOf(parent, node);

        if(current >= 0 && current < index)
        {
            index -= 1; // removing the node first shifts everything after it down
        }

        if(current === index)
        {
            return;
        }
    }

    state.pushHistory();

    if(node.parent)
    {
        (node.parent as unknown as IContainerLike).removeChild(node);
    }

    container.addChildAt(node, Math.max(0, Math.min(container.numChildren, index)));
    state.notifyTreeChanged();
    state.select(node);
}

/** Reparents `child` under `newParent` (rejecting cycles and no-ops). */
export function reparent(state: EditorState, child: IWindow, newParent: IWindow): void
{
    if(!child || !newParent || child === newParent || child.disposed || newParent.disposed)
    {
        return;
    }

    // Reject reparenting into the node's own descendant.
    let ancestor: IWindow | null = newParent;

    while(ancestor)
    {
        if(ancestor === child)
        {
            return;
        }

        ancestor = ancestor.parent;
    }

    state.pushHistory();

    const target = newParent.getLayoutChildTarget();

    if(child.parent)
    {
        (child.parent as unknown as IContainerLike).removeChild(child);
    }

    (target as unknown as IContainerLike).addChild(child);
    state.notifyTreeChanged();
    state.select(child);
}

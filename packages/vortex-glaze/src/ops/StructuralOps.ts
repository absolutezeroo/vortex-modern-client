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
    const parent = (state.selected ?? state.rootWindow) as IWindow | null;

    if(!parent || parent.disposed)
    {
        return;
    }

    const type = TYPE_NAME_TO_CODE[typeName];

    if(type === undefined)
    {
        return;
    }

    state.pushHistory();

    const target = parent.getLayoutChildTarget();
    const name = `${typeName}_${counter++}`;
    const created = target.context.create(
        name, '', type, target.style, 0,
        {x: 0, y: 0, width: 60, height: 30},
        null, target, 0, null, '', null
    );

    state.notifyTreeChanged();
    state.select(created);
}

/** Destroys the selected node (never the root) and selects its parent. */
export function deleteSelected(state: EditorState): void
{
    const win = state.selected as unknown as WindowController | null;

    if(!win || win.disposed || (win as unknown as IWindow) === state.rootWindow)
    {
        return;
    }

    const parent = win.parent;

    state.pushHistory();
    win.destroy();
    state.select(parent ?? state.rootWindow);
    state.notifyTreeChanged();
}

/** Clones the selected node into its parent, offset by the grid. */
export function cloneSelected(state: EditorState): void
{
    const win = state.selected as unknown as WindowController | null;

    if(!win || win.disposed)
    {
        return;
    }

    const parent = win.parent as unknown as IContainerLike | null;

    if(!parent)
    {
        return;
    }

    state.pushHistory();

    const clone = win.clone() as unknown as WindowController;

    parent.addChild(clone);

    const offset = state.snap || 8;

    clone.rectangle = {x: win.x + offset, y: win.y + offset, width: win.width, height: win.height};
    state.notifyTreeChanged();
    state.select(clone as unknown as IWindow);
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

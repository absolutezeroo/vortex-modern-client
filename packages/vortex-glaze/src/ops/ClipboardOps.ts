import type {IWindow} from '@core/window/IWindow';
import type {WindowController} from '@core/window/WindowController';
import {deleteSelected} from './StructuralOps';
import type {EditorState} from '../state/EditorState';

interface IContainerLike { addChild(child: IWindow): IWindow; }

/**
 * Clipboard for node subtrees (Ctrl+C / Ctrl+X / Ctrl+V). No AS3 equivalent —
 * Glaze authoring tooling built on the engine's own `clone()` primitive.
 *
 * Copy stores a detached deep-clone of the selection, independent of the live
 * tree, so it survives edits, deletes and layout switches (all within the one
 * shared window context). Paste clones the stored node again, so the same copy
 * can be pasted repeatedly.
 */
let clipboard: WindowController | null = null;

export function hasClipboard(): boolean
{
    return clipboard !== null && !clipboard.disposed;
}

/** Stores a detached clone of the selected node. */
export function copySelected(state: EditorState): void
{
    const win = state.selected as unknown as WindowController | null;

    if(!win || win.disposed)
    {
        return;
    }

    const previous = clipboard;

    clipboard = win.clone() as unknown as WindowController;

    if(previous && previous !== clipboard && !previous.disposed)
    {
        previous.destroy();
    }
}

/** Copies then deletes the selection (delete records its own undo step). */
export function cutSelected(state: EditorState): void
{
    const win = state.selected as unknown as WindowController | null;

    if(!win || win.disposed || (win as unknown as IWindow) === state.rootWindow)
    {
        return;
    }

    copySelected(state);
    deleteSelected(state);
}

/**
 * Pastes the clipboard as a sibling of the selection (or a child of the root when
 * the root is selected), offset by the grid, and selects the new node.
 */
export function pasteClipboard(state: EditorState): void
{
    if(!clipboard || clipboard.disposed)
    {
        return;
    }

    const selected = (state.selected ?? state.rootWindow) as unknown as WindowController | null;

    if(!selected || selected.disposed)
    {
        return;
    }

    const parentWin = ((selected as unknown as IWindow) === state.rootWindow || !selected.parent)
        ? (selected as unknown as IWindow)
        : selected.parent;
    const container = parentWin.getLayoutChildTarget() as unknown as IContainerLike;

    state.pushHistory();

    const copy = clipboard.clone() as unknown as WindowController;

    container.addChild(copy as unknown as IWindow);

    const offset = state.snap || 8;

    copy.rectangle = {x: copy.x + offset, y: copy.y + offset, width: copy.width, height: copy.height};
    state.notifyTreeChanged();
    state.select(copy as unknown as IWindow);
}

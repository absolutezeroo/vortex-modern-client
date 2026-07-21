import type {WindowController} from '@core/window/WindowController';
import {Logger} from '@core/utils/Logger';
import {cloneSelected, deleteSelected} from '../ops/StructuralOps';
import {copySelected, cutSelected, pasteClipboard} from '../ops/ClipboardOps';
import {saveLayout} from '../ops/LayoutSerializer';
import type {EditorState} from '../state/EditorState';

const log = Logger.getLogger('GlazeShortcuts');

/**
 * GlazeShortcuts — keyboard bindings for the editor, à la Glaze.
 *
 * Undo/redo (Ctrl+Z / Ctrl+Y / Ctrl+Shift+Z), clipboard (Ctrl+C/X/V), duplicate
 * (Ctrl+D), delete (Del/Backspace), save (Ctrl+S), 1px nudge (arrows; ×snap with
 * Shift) and deselect (Esc). The listener is global but stands down whenever a
 * text field is focused — the Illumina `input` widgets bridge to a hidden DOM
 * `<input>`, so Ctrl+C/V and arrows there must edit text, not the node tree.
 */
export class GlazeShortcuts
{
    private readonly _state: EditorState;

    public constructor(state: EditorState)
    {
        this._state = state;
        window.addEventListener('keydown', this._onKeyDown, true);
    }

    private readonly _onKeyDown = (event: KeyboardEvent): void =>
    {
        if(this.isEditingText())
        {
            return;
        }

        const ctrl = event.ctrlKey || event.metaKey;
        const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;

        if(ctrl && key === 'z' && !event.shiftKey)
        {
            event.preventDefault();
            this._state.undo();
        }
        else if(ctrl && (key === 'y' || (key === 'z' && event.shiftKey)))
        {
            event.preventDefault();
            this._state.redo();
        }
        else if(ctrl && key === 'c')
        {
            event.preventDefault();
            copySelected(this._state);
        }
        else if(ctrl && key === 'x')
        {
            event.preventDefault();
            cutSelected(this._state);
        }
        else if(ctrl && key === 'v')
        {
            event.preventDefault();
            pasteClipboard(this._state);
        }
        else if(ctrl && key === 'd')
        {
            event.preventDefault();
            cloneSelected(this._state);
        }
        else if(ctrl && key === 's')
        {
            event.preventDefault();
            void this.save();
        }
        else if(key === 'Delete' || key === 'Backspace')
        {
            event.preventDefault();
            deleteSelected(this._state);
        }
        else if(key === 'ArrowUp')
        {
            event.preventDefault();
            this.nudge(0, -this.step(event));
        }
        else if(key === 'ArrowDown')
        {
            event.preventDefault();
            this.nudge(0, this.step(event));
        }
        else if(key === 'ArrowLeft')
        {
            event.preventDefault();
            this.nudge(-this.step(event), 0);
        }
        else if(key === 'ArrowRight')
        {
            event.preventDefault();
            this.nudge(this.step(event), 0);
        }
        else if(key === 'Escape')
        {
            this._state.select(null);
        }
    };

    /** Shift nudges by the grid step (or 10px if snapping is off); otherwise 1px. */
    private step(event: KeyboardEvent): number
    {
        return event.shiftKey ? (this._state.snap || 10) : 1;
    }

    private nudge(dx: number, dy: number): void
    {
        const win = this._state.selected as unknown as WindowController | null;

        if(!win || win.disposed)
        {
            return;
        }

        this._state.pushHistory('nudge');
        win.rectangle = {x: win.x + dx, y: win.y + dy, width: win.width, height: win.height};
        this._state.notifyGeometryChanged();
    }

    private async save(): Promise<void>
    {
        const result = await saveLayout(this._state);

        log.info(`Save: ${result.message}`);
    }

    /** True when a DOM text field (the input-widget bridge) has focus. */
    private isEditingText(): boolean
    {
        const el = document.activeElement as HTMLElement | null;

        if(!el)
        {
            return false;
        }

        return el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable === true;
    }

    public dispose(): void
    {
        window.removeEventListener('keydown', this._onKeyDown, true);
    }
}

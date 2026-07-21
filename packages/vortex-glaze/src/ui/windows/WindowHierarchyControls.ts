import type {IWindow} from '@core/window/IWindow';
import type {WindowController} from '@core/window/WindowController';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import {type EditorState} from '../../state/EditorState';
import {ADDABLE_TYPES, addChildOfType, cloneSelected, convertSelected, deleteSelected, reorderSelected} from '../../ops/StructuralOps';
import {GLAZE_THEMES, setTheme} from '../../ops/ThemeOps';
import type {WindowHierarchy} from './WindowHierarchy';

interface IContainerLike { addChild(child: IWindow): IWindow; }
interface IDropWidget { populate(items: unknown[]): void; selection: number; }

/**
 * WindowHierarchyControls — the tree's action strip (Glaze's Create / Set Theme /
 * clone / delete / reorder row), built from Habbo widgets above the tree list.
 */
export class WindowHierarchyControls
{
    private readonly _state: EditorState;
    private readonly _wm: EditorState['runtime']['windowManager'];
    private readonly _bar: IWindow;
    private readonly _hierarchy: WindowHierarchy | null;
    private _typeDrop: IDropWidget | null = null;
    private _themeDrop: IDropWidget | null = null;

    public constructor(state: EditorState, bar: IWindow, hierarchy: WindowHierarchy | null)
    {
        this._state = state;
        this._wm = state.runtime.windowManager;
        this._bar = bar;
        this._hierarchy = hierarchy;

        this.build();
    }

    private build(): void
    {
        // Row 1: type dropdown + Create + Convert + Del + move
        this._typeDrop = this.dropdown(4, 4, 78, ADDABLE_TYPES);
        this.button('Create', 86, 4, 46, () => addChildOfType(this._state, this.type()));
        this.button('Convert', 136, 4, 56, () => convertSelected(this._state, this.type()));
        this.button('Del', 196, 4, 36, () => deleteSelected(this._state));
        this.button('↑', 236, 4, 22, () => reorderSelected(this._state, -1));
        this.button('↓', 262, 4, 22, () => reorderSelected(this._state, 1));

        // Row 2: theme dropdown + Set Theme + Clone + Expand
        this._themeDrop = this.dropdown(4, 32, 96, GLAZE_THEMES);
        this.button('Set Theme', 104, 32, 70, () =>
        {
            const theme = GLAZE_THEMES[this._themeDrop?.selection ?? 0] ?? GLAZE_THEMES[0];

            setTheme(this._state, theme);
        });
        this.button('Clone', 178, 32, 46, () => cloneSelected(this._state));
        this.button('Expand', 228, 32, 56, () => this._hierarchy?.expandAll());
    }

    private type(): string
    {
        return ADDABLE_TYPES[this._typeDrop?.selection ?? 0] ?? ADDABLE_TYPES[0];
    }

    private button(caption: string, x: number, y: number, width: number, onClick: () => void): void
    {
        const btn = this._wm.buildWidgetLayout('glaze_button_xml');

        if(!btn) return;

        const bc = btn as unknown as WindowController;

        bc.caption = caption;
        (this._bar as unknown as IContainerLike).addChild(btn);
        bc.rectangle = {x, y, width, height: 24};
        bc.procedure = (event: WindowEvent): void =>
        {
            if(event.type === WindowMouseEvent.CLICK) onClick();
        };
    }

    private dropdown(x: number, y: number, width: number, items: string[]): IDropWidget | null
    {
        const dd = this._wm.buildWidgetLayout('glaze_dropdown_xml');

        if(!dd) return null;

        (this._bar as unknown as IContainerLike).addChild(dd);
        (dd as unknown as WindowController).rectangle = {x, y, width, height: 22};

        const drop = dd as unknown as IDropWidget;

        drop.populate(items);

        return drop;
    }
}

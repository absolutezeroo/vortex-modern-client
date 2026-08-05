import type {IWindow} from '@core/window/IWindow';
import type {WindowController} from '@core/window/WindowController';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import {type EditorState} from '../../state/EditorState';
import {addChildOfType, cloneSelected, convertSelected, deleteSelected, reorderSelected} from '../../ops/StructuralOps';
import {specFor, type IWidgetSpec} from '../../ops/WidgetCatalog';
import {GLAZE_THEMES, setTheme} from '../../ops/ThemeOps';
import type {WindowHierarchy} from './WindowHierarchy';
import type {WindowPalette} from './WindowPalette';

interface IContainerLike { addChild(child: IWindow): IWindow; }
interface IDropWidget { populate(items: unknown[]): void; selection: number; }

/** The type Create/Convert start on, before anything is picked. */
const DEFAULT_TYPE = 'container';

/**
 * WindowHierarchyControls — the tree's action strip (Glaze's Create / Set Theme /
 * clone / delete / reorder row), built from Habbo widgets above the tree list.
 *
 * The type to create or convert to is chosen through the Widgets popup rather
 * than a drop menu: the strip only shows which type is armed. A drop menu would
 * have to list all 94 window types in one expanded column — the ported
 * `dropmenu` sizes itself to the total item height and does not scroll — and the
 * nine-type list it used to carry was the real limit on what Convert could reach.
 */
export class WindowHierarchyControls
{
    private readonly _state: EditorState;
    private readonly _wm: EditorState['runtime']['windowManager'];
    private readonly _bar: IWindow;
    private readonly _hierarchy: WindowHierarchy | null;
    private readonly _palette: WindowPalette | null;
    private _themeDrop: IDropWidget | null = null;
    private _typeButton: WindowController | null = null;
    private _type: IWidgetSpec;

    public constructor(
        state: EditorState,
        bar: IWindow,
        hierarchy: WindowHierarchy | null,
        palette: WindowPalette | null = null
    )
    {
        this._state = state;
        this._wm = state.runtime.windowManager;
        this._bar = bar;
        this._hierarchy = hierarchy;
        this._palette = palette;
        this._type = specFor(DEFAULT_TYPE) ?? {type: DEFAULT_TYPE, label: DEFAULT_TYPE, width: 60, height: 30};

        this.build();
    }

    private build(): void
    {
        // Row 1: armed type + Create + Convert
        this._typeButton = this.button(this.typeCaption(), 4, 4, 180, () => this.chooseType());
        this.button('Create', 188, 4, 54, () => addChildOfType(this._state, this._type.type));
        this.button('Convert', 246, 4, 56, () => convertSelected(this._state, this._type.type));

        // Row 2: delete + move + clone + expand
        this.button('Del', 4, 32, 36, () => deleteSelected(this._state));
        this.button('↑', 44, 32, 22, () => reorderSelected(this._state, -1));
        this.button('↓', 70, 32, 22, () => reorderSelected(this._state, 1));
        this.button('Clone', 96, 32, 46, () => cloneSelected(this._state));
        this.button('Expand', 146, 32, 56, () => this._hierarchy?.expandAll());

        // Row 3: theme dropdown + Set Theme
        this._themeDrop = this.dropdown(4, 60, 96, GLAZE_THEMES);
        this.button('Set Theme', 104, 60, 70, () =>
        {
            const theme = GLAZE_THEMES[this._themeDrop?.selection ?? 0] ?? GLAZE_THEMES[0];

            setTheme(this._state, theme);
        });
    }

    /** Opens the widget library as a type picker and arms whatever comes back. */
    private chooseType(): void
    {
        this._palette?.toggle('pick', (spec) =>
        {
            this._type = spec;

            if(this._typeButton && !this._typeButton.disposed)
            {
                this._typeButton.caption = this.typeCaption();
            }
        });
    }

    private typeCaption(): string
    {
        return `Type: ${this._type.label}`;
    }

    private button(caption: string, x: number, y: number, width: number, onClick: () => void): WindowController | null
    {
        const btn = this._wm.buildWidgetLayout('glaze_button_xml');

        if(!btn) return null;

        const bc = btn as unknown as WindowController;

        bc.caption = caption;
        (this._bar as unknown as IContainerLike).addChild(btn);
        bc.rectangle = {x, y, width, height: 24};
        bc.procedure = (event: WindowEvent): void =>
        {
            if(event.type === WindowMouseEvent.CLICK) onClick();
        };

        return bc;
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

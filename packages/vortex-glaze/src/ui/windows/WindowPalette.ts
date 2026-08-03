import type {IWindow} from '@core/window/IWindow';
import type {WindowController} from '@core/window/WindowController';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import {TYPE_NAME_TO_CODE} from '@core/window/enum/WindowType';
import {Logger} from '@core/utils/Logger';
import {addWidget, type IWidgetSpec} from '../../ops/StructuralOps';
import {type EditorState} from '../../state/EditorState';
import {closesOnHeaderButton, fitPopupToDesktop} from './PopupChrome';
import {slotsOf} from '../LayoutSlots';

const log = Logger.getLogger('glaze.ui.windows.WindowPalette');

const PALETTE = slotsOf('glaze_palette_xml');
const PALETTE_ROW = slotsOf('glaze_palette_row_xml');

interface IContainerLike { addChild(child: IWindow): IWindow; }
interface IListLike { addListItem(item: IWindow): IWindow; destroyListItems(): void; }

const PALETTE_LAYER = 3;

/**
 * The widgets the palette offers, with the geometry, caption and `params` each
 * needs to be recognisable — the values are the ones the shipped layouts use for
 * that element (a `button` is `params="1"`, a clickable `region` `params="17"`,
 * an `input` `params="2177"`).
 */
export const WIDGET_CATALOG: IWidgetSpec[] = [
    {type: 'container', label: 'Container', width: 160, height: 90, params: 16},
    {type: 'region', label: 'Region (clickable)', width: 120, height: 40, params: 17},
    {type: 'border', label: 'Border', width: 140, height: 60, params: 16},
    {type: 'frame', label: 'Frame', width: 200, height: 140, caption: 'Frame', params: 1},
    {type: 'header', label: 'Header', width: 180, height: 24, caption: 'Header', params: 16},
    {type: 'text', label: 'Text', width: 140, height: 32, caption: 'Text', params: 16},
    {type: 'label', label: 'Label', width: 110, height: 16, caption: 'Label', params: 16},
    {type: 'formatted_text', label: 'Formatted text', width: 160, height: 48, caption: 'Formatted', params: 16},
    {type: 'link', label: 'Link', width: 110, height: 16, caption: 'Link', params: 17},
    {type: 'button', label: 'Button', width: 90, height: 26, caption: 'Button', params: 1},
    {type: 'button_icon', label: 'Icon button', width: 26, height: 26, params: 1},
    {type: 'closebutton', label: 'Close button', width: 20, height: 20, params: 1},
    {type: 'checkbox', label: 'Checkbox', width: 19, height: 20, params: 17},
    {type: 'radiobutton', label: 'Radio button', width: 19, height: 20, params: 17},
    {type: 'input', label: 'Input field', width: 150, height: 20, params: 2177},
    {type: 'password', label: 'Password field', width: 150, height: 20, params: 2177},
    {type: 'dropmenu', label: 'Drop menu', width: 150, height: 22, params: 1},
    {type: 'selector', label: 'Selector', width: 120, height: 24, caption: 'Selector', params: 1},
    {type: 'slider_horizontal', label: 'Slider', width: 140, height: 20, params: 1},
    {type: 'itemlist_vertical', label: 'Item list (vertical)', width: 160, height: 90, params: 0},
    {type: 'itemlist_horizontal', label: 'Item list (horizontal)', width: 160, height: 40, params: 0},
    {type: 'scrollable_itemlist_vertical', label: 'Scrollable list', width: 170, height: 110, params: 16},
    {type: 'itemgrid_vertical', label: 'Item grid', width: 160, height: 90, params: 0},
    {type: 'tab_context', label: 'Tab context', width: 220, height: 140, params: 2064},
    {type: 'tab_container_button', label: 'Tab button', width: 90, height: 26, caption: 'Tab', params: 147473},
    {type: 'static_bitmap', label: 'Static bitmap', width: 48, height: 48, params: 16},
    {type: 'bitmap', label: 'Bitmap', width: 48, height: 48, params: 16},
    {type: 'scrollbar_vertical', label: 'Scrollbar', width: 17, height: 90, params: 16}
];

/**
 * WindowPalette — the widget library, as a popup of live previews.
 *
 * Glaze only ever offered a type dropdown; Clove pairs each entry with a rendered
 * thumbnail so a control is picked by sight. Here the preview needs no snapshot
 * machinery at all: each row builds a **real instance** of the window type inside
 * itself, so what the list shows is the widget as the engine will actually draw it
 * — including the current theme's skin. Clicking a row creates the same spec under
 * the selected node.
 */
export class WindowPalette
{
    private readonly _state: EditorState;
    private readonly _wm: EditorState['runtime']['windowManager'];
    private _frame: IWindow | null = null;

    public constructor(state: EditorState)
    {
        this._state = state;
        this._wm = state.runtime.windowManager;
    }

    public toggle(): void
    {
        if(this._frame && !this._frame.disposed)
        {
            this.close();

            return;
        }

        this.open();
    }

    private open(): void
    {
        const frame = this._wm.buildWidgetLayout('glaze_palette_xml', PALETTE_LAYER);

        if(!frame) return;

        const desktop = this._wm.getDesktop(PALETTE_LAYER);

        if(!frame.parent && desktop)
        {
            (desktop as unknown as IContainerLike).addChild(frame);
        }

        fitPopupToDesktop(frame, desktop, PALETTE.find(frame, 'glaze_palette_list'));
        closesOnHeaderButton(frame, () => this.close());

        this._frame = frame;
        this._state.modalOpen = true;

        const list = PALETTE.findAs<IListLike>(frame, 'glaze_palette_list');

        if(list) this.populate(list);
    }

    private populate(list: IListLike): void
    {
        for(const spec of WIDGET_CATALOG)
        {
            if(TYPE_NAME_TO_CODE[spec.type] === undefined)
            {
                log.warn(`Palette entry "${spec.type}" is not a known window type — skipped`);

                continue;
            }

            const row = this._wm.buildWidgetLayout('glaze_palette_row_xml');

            if(!row) continue;

            PALETTE_ROW.setText(row, 'glaze_wrow_label', spec.label);
            PALETTE_ROW.setText(row, 'glaze_wrow_type', spec.type);
            this.buildPreview(PALETTE_ROW.find(row, 'glaze_wrow_preview'), spec);

            (row as unknown as WindowController).procedure = (event: WindowEvent): void =>
            {
                if(event.type === WindowMouseEvent.CLICK) this.pick(spec);
            };

            list.addListItem(row);
        }
    }

    /** Builds a real instance of the spec inside the row's preview box. */
    private buildPreview(host: IWindow | null, spec: IWidgetSpec): void
    {
        if(!host || host.disposed) return;

        const type = TYPE_NAME_TO_CODE[spec.type];
        const width = Math.min(spec.width, host.width - 8);
        const height = Math.min(spec.height, host.height - 8);

        try
        {
            const preview = host.context.create(
                `preview_${spec.type}`, spec.caption ?? '', type, host.style, spec.params ?? 0,
                {x: 4, y: Math.max(2, Math.round((host.height - height) / 2)), width, height},
                null, host, 0, null, '', null
            );

            // A preview must never react to the mouse: the click belongs to the row.
            if(preview) (preview as unknown as WindowController).setParamFlag(1, false);
        }
        catch (error)
        {
            log.warn(`Preview for "${spec.type}" failed to build`, error);
        }
    }

    private pick(spec: IWidgetSpec): void
    {
        const created = addWidget(this._state, spec);

        if(!created)
        {
            log.warn(`Could not add "${spec.type}" — no valid parent selected`);
        }

        this.close();
    }

    private close(): void
    {
        this._frame?.destroy();
        this._frame = null;
        this._state.modalOpen = false;
    }

    public dispose(): void
    {
        this.close();
    }
}

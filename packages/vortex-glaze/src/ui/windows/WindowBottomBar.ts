import type {IWindow} from '@core/window/IWindow';
import type {WindowController} from '@core/window/WindowController';
import {Logger} from '@core/utils/Logger';
import {EditorEvents, type EditorState} from '../../state/EditorState';

const log = Logger.getLogger('GlazeBottomBar');

interface IContainerLike { addChild(child: IWindow): IWindow; }
interface ICheckWidget { isSelected: boolean; addEventListener(type: string, cb: () => void): void; }
interface IDropWidget { populate(items: unknown[]): void; selection: number; addEventListener(type: string, cb: () => void): void; }

/**
 * WindowBottomBar — Glaze's status bar, as Habbo widgets.
 *
 * Debug-view toggles (Show Tags / Debug Rects / Show scaler), the current
 * selection's colour (swatch + hex), the live mouse coordinates, and a Locales
 * dropdown.
 */
export class WindowBottomBar
{
    private readonly _state: EditorState;
    private readonly _wm: EditorState['runtime']['windowManager'];
    private readonly _bar: IWindow;
    private _x = 12;
    private _coords: { text: string } | null = null;
    private _swatch: WindowController | null = null;
    private _colorLabel: { text: string } | null = null;
    private _rafId = 0;

    public constructor(state: EditorState, bar: IWindow)
    {
        this._state = state;
        this._wm = state.runtime.windowManager;
        this._bar = bar;

        this.build();
        state.events.on(EditorEvents.SELECTION_CHANGED, this._refreshColor);
        this._refreshColor();
        this.startCoordsLoop();
    }

    private build(): void
    {
        this.toggle('Show Tags', () => this._state.showTags, (v) => { this._state.showTags = v; this._state.notifyDebugChanged(); });
        this.toggle('Debug Rects', () => this._state.debugRects, (v) => { this._state.debugRects = v; this._state.notifyDebugChanged(); });
        this.toggle('Show scaler', () => this._state.showScaler, (v) => { this._state.showScaler = v; this._state.notifyDebugChanged(); });

        this._x += 14;
        this.label('Colour', this._x, 7, 44);
        this._x += 48;
        this._swatch = this.swatch();
        this._x += 24;
        this._colorLabel = this.labelRef('', this._x, 7, 78);
        this._x += 84;

        this.label('Coords', this._x, 7, 46);
        this._x += 50;
        this._coords = this.labelRef('0, 0', this._x, 7, 80);
        this._x += 86;

        this.label('Locales', this._x, 7, 50);
        this._x += 54;
        this.locales();
    }

    private toggle(text: string, read: () => boolean, write: (v: boolean) => void): void
    {
        const width = text.length * 7 + 4;

        this.label(text, this._x, 7, width);
        this._x += width;

        const chk = this._wm.buildWidgetLayout('glaze_check_xml');

        if(!chk) return;

        (this._bar as unknown as IContainerLike).addChild(chk);
        (chk as unknown as WindowController).rectangle = {x: this._x, y: 3, width: 19, height: 21};
        this._x += 26;

        const widget = chk as unknown as ICheckWidget;

        widget.isSelected = read();
        widget.addEventListener('WE_SELECTED', () => write(true));
        widget.addEventListener('WE_UNSELECTED', () => write(false));
    }

    private label(text: string, x: number, y: number, width: number): void
    {
        const lbl = this._wm.buildWidgetLayout('glaze_label_xml');

        if(!lbl) return;

        (lbl as unknown as { text: string }).text = text;
        (this._bar as unknown as IContainerLike).addChild(lbl);
        (lbl as unknown as WindowController).rectangle = {x, y, width, height: 16};
    }

    private labelRef(text: string, x: number, y: number, width: number): { text: string }
    {
        const lbl = this._wm.buildWidgetLayout('glaze_label_xml');

        if(!lbl) return {text: ''};

        (lbl as unknown as { text: string }).text = text;
        (this._bar as unknown as IContainerLike).addChild(lbl);
        (lbl as unknown as WindowController).rectangle = {x, y, width, height: 16};

        return lbl as unknown as { text: string };
    }

    private swatch(): WindowController | null
    {
        const sw = this._wm.buildWidgetLayout('glaze_swatch_xml');

        if(!sw) return null;

        (this._bar as unknown as IContainerLike).addChild(sw);
        (sw as unknown as WindowController).rectangle = {x: this._x, y: 5, width: 18, height: 18};

        return sw as unknown as WindowController;
    }

    private locales(): void
    {
        const dd = this._wm.buildWidgetLayout('glaze_dropdown_xml');

        if(!dd) return;

        (this._bar as unknown as IContainerLike).addChild(dd);
        (dd as unknown as WindowController).rectangle = {x: this._x, y: 3, width: 120, height: 22};

        const drop = dd as unknown as IDropWidget;
        const locales = ['en', 'fr', 'de', 'es', 'it', 'nl', 'pt', 'fi'];

        drop.populate(locales);
        drop.addEventListener('WE_SELECTED', () => log.info(`Locale: ${locales[drop.selection]} — not applied (Glaze editor)`));
    }

    private readonly _refreshColor = (): void =>
    {
        const sel = this._state.selected as unknown as WindowController | null;
        const color = sel && !sel.disposed ? (sel.color >>> 0) : 0xffffffff;

        if(this._swatch) this._swatch.color = color;
        if(this._colorLabel) this._colorLabel.text = `0x${color.toString(16).padStart(8, '0')}`;
    };

    private startCoordsLoop(): void
    {
        const loop = (): void =>
        {
            if(this._coords)
            {
                const label = `${this._state.mouse.x}, ${this._state.mouse.y}`;

                if(this._coords.text !== label)
                {
                    this._coords.text = label;
                }
            }

            this._rafId = requestAnimationFrame(loop);
        };

        this._rafId = requestAnimationFrame(loop);
    }

    public dispose(): void
    {
        if(this._rafId) cancelAnimationFrame(this._rafId);
        this._state.events.off(EditorEvents.SELECTION_CHANGED, this._refreshColor);
    }
}

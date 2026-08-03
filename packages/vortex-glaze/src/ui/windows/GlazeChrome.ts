import type {IWindow} from '@core/window/IWindow';
import type {WindowController} from '@core/window/WindowController';
import type {IHabboWindowManager} from '@habbo/window';
import type {EditorState} from '../../state/EditorState';
import {Logger} from '@core/utils/Logger';
import type {GlazeLayoutName} from '../GlazeLayoutSlots';
import {slotsOf} from '../LayoutSlots';

const log = Logger.getLogger('glaze.ui.windows.GlazeChrome');

const HIERARCHY = slotsOf('glaze_hierarchy_xml');
const PROPERTY = slotsOf('glaze_property_xml');

/** Desktop layer the editor chrome lives on (above the edited layout on layer 1). */
const CHROME_LAYER = 2;
const TOOLBAR_H = 78;
const BOTTOM_H = 28;
const LEFT_W = 318;
const RIGHT_W = 368;
const MIN_LEFT_W = 200;
const MIN_RIGHT_W = 240;

/** The `<frame>` margins the panel layouts declare, in `<variables>`. */
const FRAME_MARGIN_X = 6;
const FRAME_MARGIN_TOP = 26;
const FRAME_MARGIN_BOTTOM = 7;

/** Height of the Hierarchy View's action strip above the tree. */
const HIERARCHY_CONTROLS_H = 60;

interface IContainerLike { addChild(child: IWindow): IWindow; }

/**
 * GlazeChrome — the editor shell, built entirely from Habbo window widgets.
 *
 * The toolbar and the two titled Illumina frames (Hierarchy View, Property
 * Editor) are authored as XML layouts and built onto desktop layer 2, above the
 * edited layout (layer 1). The centre is left empty so the edited layout shows
 * through; the opaque panels cover its overflow. Everything composites onto the
 * same 2D canvas as the game UI — no DOM.
 */
export class GlazeChrome
{
    private readonly _state: EditorState;
    private readonly _wm: IHabboWindowManager;

    private _toolbar: IWindow | null = null;
    private _hierarchy: IWindow | null = null;
    private _property: IWindow | null = null;
    private _bottom: IWindow | null = null;
    private _toolbarSizer: ((width: number) => number) | null = null;
    private _toolbarHeight = TOOLBAR_H;
    private _leftWidth = LEFT_W;
    private _rightWidth = RIGHT_W;

    public constructor(state: EditorState)
    {
        this._state = state;
        this._wm = state.runtime.windowManager;
    }

    public get contentInsets(): { top: number; left: number; right: number; bottom: number }
    {
        return {top: this._toolbarHeight, left: this._leftWidth, right: this._rightWidth, bottom: BOTTOM_H};
    }

    /**
     * Registers the toolbar's reflow. The bar packs itself into the canvas width
     * and reports the height it needs, which decides where the panels start —
     * so the chrome cannot be laid out until the toolbar exists (it is built
     * after `mount()`), and registering re-runs the layout.
     */
    public setToolbarSizer(sizer: ((width: number) => number) | null): void
    {
        this._toolbarSizer = sizer;
        this.layout();
    }

    public get hierarchyList(): IWindow | null
    {
        return HIERARCHY.find(this._hierarchy, 'glaze_hierarchy_list');
    }

    public get hierarchyControls(): IWindow | null
    {
        return HIERARCHY.find(this._hierarchy, 'glaze_hierarchy_controls');
    }

    public get propertyList(): IWindow | null
    {
        return PROPERTY.find(this._property, 'glaze_property_list');
    }

    public get toolbar(): IWindow | null
    {
        return this._toolbar;
    }

    public get bottomBar(): IWindow | null
    {
        return this._bottom;
    }

    public mount(): void
    {
        this._toolbar = this.build('glaze_toolbar_xml');
        this._hierarchy = this.build('glaze_hierarchy_xml');
        this._property = this.build('glaze_property_xml');
        this._bottom = this.build('glaze_bottombar_xml');

        this.layout();
        window.addEventListener('resize', this._onResize);
    }

    private build(name: GlazeLayoutName): IWindow | null
    {
        const win = this._wm.buildWidgetLayout(name, CHROME_LAYER);

        if(!win)
        {
            log.warn(`Chrome layout "${name}" failed to build`);

            return null;
        }

        // buildFromXML can return the root detached; ensure it is on the layer-2 desktop.
        if(!win.parent)
        {
            const desktop = this._wm.getDesktop(CHROME_LAYER);

            if(desktop)
            {
                (desktop as unknown as IContainerLike).addChild(win);
            }
        }

        return win;
    }

    /** Re-runs the layout; the canvas calls this after it resizes the desktops. */
    public relayout(): void
    {
        this.layout();
    }

    private readonly _onResize = (): void => this.layout();

    private layout(): void
    {
        const desktop = this._wm.getDesktop(CHROME_LAYER);

        if(!desktop)
        {
            return;
        }

        const w = desktop.width;
        const h = desktop.height;

        // On a narrow canvas the two panels would leave no editing area at all,
        // so they give ground before the centre does.
        this._leftWidth = Math.max(MIN_LEFT_W, Math.min(LEFT_W, Math.floor(w * 0.30)));
        this._rightWidth = Math.max(MIN_RIGHT_W, Math.min(RIGHT_W, Math.floor(w * 0.34)));
        this._toolbarHeight = this._toolbarSizer ? this._toolbarSizer(w) : TOOLBAR_H;

        const midH = Math.max(80, h - this._toolbarHeight - BOTTOM_H);

        this.setRect(this._toolbar, 0, 0, w, this._toolbarHeight);
        this.setRect(this._hierarchy, 0, this._toolbarHeight, this._leftWidth, midH);
        this.setRect(this._property, w - this._rightWidth, this._toolbarHeight, this._rightWidth, midH);
        this.setRect(this._bottom, 0, h - BOTTOM_H, w, BOTTOM_H);
        this.fitPanelContents(midH);
    }

    /**
     * Sizes each panel's list to its frame. The lists are authored at a fixed size
     * and carry no relative-scaling flags, so a resized frame leaves them behind:
     * short of the bottom on a tall window, past it on a short one.
     */
    private fitPanelContents(midH: number): void
    {
        const contentH = Math.max(60, midH - FRAME_MARGIN_TOP - FRAME_MARGIN_BOTTOM);

        this.setRect(
            this.hierarchyControls,
            0, 0,
            Math.max(120, this._leftWidth - FRAME_MARGIN_X * 2),
            HIERARCHY_CONTROLS_H
        );
        this.setRect(
            this.hierarchyList,
            0, HIERARCHY_CONTROLS_H + 2,
            Math.max(120, this._leftWidth - FRAME_MARGIN_X * 2),
            Math.max(60, contentH - HIERARCHY_CONTROLS_H - 2)
        );
        this.setRect(
            this.propertyList,
            0, 0,
            Math.max(160, this._rightWidth - FRAME_MARGIN_X * 2),
            contentH
        );
    }

    private setRect(win: IWindow | null, x: number, y: number, width: number, height: number): void
    {
        if(!win || win.disposed)
        {
            return;
        }

        (win as unknown as WindowController).rectangle = {x, y, width, height};
    }

    public dispose(): void
    {
        window.removeEventListener('resize', this._onResize);
        this._toolbar?.destroy();
        this._hierarchy?.destroy();
        this._property?.destroy();
        this._bottom?.destroy();
    }
}

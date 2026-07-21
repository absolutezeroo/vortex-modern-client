import type {IWindow} from '@core/window/IWindow';
import type {WindowController} from '@core/window/WindowController';
import type {IHabboWindowManager} from '@habbo/window';
import type {EditorState} from '../../state/EditorState';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('GlazeChrome');

/** Desktop layer the editor chrome lives on (above the edited layout on layer 1). */
const CHROME_LAYER = 2;
const TOOLBAR_H = 78;
const BOTTOM_H = 28;
const LEFT_W = 300;
const RIGHT_W = 344;

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

    public constructor(state: EditorState)
    {
        this._state = state;
        this._wm = state.runtime.windowManager;
    }

    public get contentInsets(): { top: number; left: number; right: number; bottom: number }
    {
        return {top: TOOLBAR_H, left: LEFT_W, right: RIGHT_W, bottom: BOTTOM_H};
    }

    public get hierarchyList(): IWindow | null
    {
        return this.findChild(this._hierarchy, 'glaze_hierarchy_list');
    }

    public get hierarchyControls(): IWindow | null
    {
        return this.findChild(this._hierarchy, 'glaze_hierarchy_controls');
    }

    public get propertyList(): IWindow | null
    {
        return this.findChild(this._property, 'glaze_property_list');
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

    private build(name: string): IWindow | null
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
        const midH = h - TOOLBAR_H - BOTTOM_H;

        this.setRect(this._toolbar, 0, 0, w, TOOLBAR_H);
        this.setRect(this._hierarchy, 0, TOOLBAR_H, LEFT_W, midH);
        this.setRect(this._property, w - RIGHT_W, TOOLBAR_H, RIGHT_W, midH);
        this.setRect(this._bottom, 0, h - BOTTOM_H, w, BOTTOM_H);
    }

    private setRect(win: IWindow | null, x: number, y: number, width: number, height: number): void
    {
        if(!win || win.disposed)
        {
            return;
        }

        (win as unknown as WindowController).rectangle = {x, y, width, height};
    }

    private findChild(root: IWindow | null, name: string): IWindow | null
    {
        if(!root || root.disposed)
        {
            return null;
        }

        return (root as unknown as { findChildByName(n: string): IWindow | null }).findChildByName(name);
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

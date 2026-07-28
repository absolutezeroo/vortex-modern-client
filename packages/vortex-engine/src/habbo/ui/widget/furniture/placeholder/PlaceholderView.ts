/**
 * PlaceholderView
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/furniture/placeholder/PlaceholderView.as
 *
 * The window shown for a placeholder furni — a piece of furniture the client has no visualization
 * for. Unlike the other furni views it is not disposed on close: `hideWindow()` only flips
 * `visible`, so re-opening reuses the same window.
 */
import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';

/**
 * AS3: PlaceholderView.as::createWindow()
 *
 * AS3 names the window `habbohelp_window`, tags it `habbo_help_window` and paints it with the
 * colour below. The placeholder reuses the help window's chrome wholesale — the names are AS3's,
 * not a copy/paste slip.
 */
const WINDOW_NAME: string = 'habbohelp_window';
const WINDOW_TAG: string = 'habbo_help_window';
const WINDOW_COLOR: number = 33554431;

// AS3: PlaceholderView.as::showWindow() — the x it is pinned to every time it is shown.
const WINDOW_X: number = 200;

export class PlaceholderView
{
    // AS3: PlaceholderView.as::_SafeStr_5517
    private _assets: IAssetLibrary | null;

    // AS3: PlaceholderView.as::_windowManager
    private _windowManager: IHabboWindowManager;

    // AS3: PlaceholderView.as::_window
    private _window: IWindowContainer | null = null;

    // AS3: PlaceholderView.as::PlaceholderView()
    constructor(assets: IAssetLibrary | null, windowManager: IHabboWindowManager)
    {
        this._assets = assets;
        this._windowManager = windowManager;
    }

    /**
     * Unused by PlaceholderWidget, which only ever calls showWindow(). Ported because AS3 declares
     * it public — absence of a caller is not absence of the member.
     */
    // AS3: PlaceholderView.as::toggleWindow()
    public toggleWindow(): void
    {
        if(this._window !== null && this._window.visible)
        {
            this.hideWindow();
        }
        else
        {
            this.showWindow();
        }
    }

    // AS3: PlaceholderView.as::showWindow()
    public showWindow(): void
    {
        if(this._window === null)
        {
            this.createWindow();
        }

        if(this._window === null) return;

        this._window.visible = true;
        this._window.x = WINDOW_X;
    }

    /**
     * AS3 creates the window itself and calls `buildFromXML()` on it; this port's window manager
     * owns both steps, so it collapses to `buildWidgetLayout('placeholder')` and the properties
     * AS3 sets afterwards are applied here.
     */
    // AS3: PlaceholderView.as::createWindow()
    private createWindow(): void
    {
        if(!this._assets?.hasAsset('placeholder')) return;

        this._window = this._windowManager.buildWidgetLayout('placeholder') as IWindowContainer | null;

        if(this._window === null) return;

        this._window.name = WINDOW_NAME;
        this._window.tags.push(WINDOW_TAG);
        this._window.background = true;
        this._window.color = WINDOW_COLOR;

        // AS3 finds the close button by tag, not by name.
        const close = this._window.findChildByTag('close');

        if(close !== null) close.procedure = this.onWindowClose;
    }

    // AS3: PlaceholderView.as::hideWindow()
    public hideWindow(): void
    {
        if(this._window !== null)
        {
            this._window.visible = false;
        }
    }

    // AS3: PlaceholderView.as::onWindowClose()
    private onWindowClose = (event: WindowEvent, _window: IWindow): void =>
    {
        if(event.type !== 'WME_CLICK') return;

        this.hideWindow();
    };

    // AS3: PlaceholderView.as::dispose()
    public dispose(): void
    {
        if(this._window !== null)
        {
            this._window.dispose();
            this._window = null;
        }
    }
}

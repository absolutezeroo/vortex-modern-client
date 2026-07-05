import type {IWindow} from '@core/window/IWindow';
import type {IDisposable} from '@core/runtime/IDisposable';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {IHabboTransitionalNavigator} from './IHabboTransitionalNavigator';
import {Util} from './Util';

/**
 * Base class for modal alert dialogs with singleton management.
 *
 * Only one alert per XML filename can be displayed at a time.
 * Subclasses override setupAlertWindow() to customize content.
 *
 * @see sources/win63_version/habbo/navigator/AlertView.as
 */
export class AlertView implements IDisposable
{
    private static _alerts: Map<string, AlertView> = new Map();
    protected _window: IWindow | null = null;
    protected _xmlFileName: string;
    protected _caption: string | null;

    constructor(navigator: IHabboTransitionalNavigator, xmlFileName: string, caption: string | null = null)
    {
        this._navigator = navigator;
        this._xmlFileName = xmlFileName;
        this._caption = caption;
    }

    private _navigator: IHabboTransitionalNavigator | null;

    get navigator(): IHabboTransitionalNavigator | null
    {
        return this._navigator;
    }

    protected _disposed: boolean = false;

    get disposed(): boolean
    {
        return this._disposed;
    }

    /**
	 * Finds an AlertView by its window reference.
	 *
	 * @param window - The window to search for
	 * @returns The associated AlertView, or null
	 */
    static findAlertView(window: IWindow): AlertView | null
    {
        for(const alertView of AlertView._alerts.values())
        {
            if(alertView._window === window)
            {
                return alertView;
            }
        }

        return null;
    }

    /**
	 * Shows the alert dialog. Disposes any existing alert with the same filename.
	 */
    show(): void
    {
        const existing = AlertView._alerts.get(this._xmlFileName);

        if(existing)
        {
            existing.dispose();
        }

        this._window = this.getAlertWindow();

        if(!this._window) return;

        if(this._caption !== null)
        {
            this._window.caption = this._caption;
        }

        this.setupAlertWindow(this._window);

        const location = Util.getLocationRelativeTo(this._window.desktop, this._window.width, this._window.height);

        this._window.x = location.x;
        this._window.y = location.y;

        AlertView._alerts.set(this._xmlFileName, this);

        this._window.activate();
    }

    dispose(): void
    {
        if(this._disposed) return;

        if(AlertView._alerts.get(this._xmlFileName) === this)
        {
            AlertView._alerts.delete(this._xmlFileName);
        }

        this._disposed = true;

        if(this._window)
        {
            this._window.destroy();
            this._window = null;
        }

        this._navigator = null;
    }

    /**
	 * Override in subclasses to customize the alert window content.
	 *
	 * @param _window - The alert window
	 */
    protected setupAlertWindow(_window: IWindow): void
    {
        // Override in subclasses
    }

    protected onClose = (_event: WindowEvent): void =>
    {
        this.dispose();
    };

    private getAlertWindow(): IWindow | null
    {
        if(!this._navigator) return null;

        const window = this._navigator.getXmlWindow(this._xmlFileName, 2);

        if(!window) return null;

        const container = window as any;

        if(container.findChildByTag)
        {
            const close = container.findChildByTag('close');

            if(close)
            {
                close.addEventListener('WME_CLICK', this.onClose);
            }
        }

        return window;
    }
}

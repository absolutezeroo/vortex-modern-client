import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {HabboLandingView} from '../HabboLandingView';
import {WindowEvent} from '@core/window/events/WindowEvent';
import {Logger} from '@core/utils/Logger';

const log = Logger.getLogger('WidgetContainerLayout');

/**
 * Default layout name constant
 */
const DEFAULT_LAYOUT: string = 'landing_view_default_dynamic_layout';

/**
 * WidgetContainerLayout
 *
 * Manages the main landing view window — creates it from a widget layout,
 * resizes it to fill the desktop, and handles visibility.
 *
 * This is a simplified version that creates and displays the main window
 * without dynamic widgets (those will be added later).
 *
 * @see sources/win63_version/habbo/friendbar/landingview/layout/WidgetContainerLayout.as
 */
export class WidgetContainerLayout
{
    protected _orgWindowWidth: number = 0;
    protected _orgWindowHeight: number = 0;

    constructor(landingView: HabboLandingView)
    {
        this._landingView = landingView;
    }

    protected _landingView: HabboLandingView | null;

    /**
	 * The landing view reference
	 */
    get landingView(): HabboLandingView | null
    {
        return this._landingView;
    }

    protected _window: IWindowContainer | null = null;

    /**
	 * The root window container
	 */
    get window(): IWindowContainer | null
    {
        return this._window;
    }

    /**
	 * Whether this layout has been disposed
	 */
    get disposed(): boolean
    {
        return this._landingView == null;
    }

    /**
	 * Activate the landing view layout.
	 *
	 * Creates the window if it doesn't exist, resizes it to fill the desktop,
	 * and sets it visible.
	 *
	 * @see sources/win63_version/habbo/friendbar/landingview/layout/WidgetContainerLayout.as activate()
	 */
    public activate(): void
    {
        if(this._window == null)
        {
            this.createWindow();
        }

        this.resizeWindow();

        // Listen for desktop resize
        if(this._landingView && this._landingView.windowManager)
        {
            const desktop = this._landingView.windowManager.getWindowContext(0).getDesktopWindow();

            if(desktop)
            {
                desktop.addEventListener(WindowEvent.WE_RESIZED, this.onDesktopResized);
            }
        }

        if(this._window)
        {
            this._window.invalidate();
            this._window.visible = true;
        }

        log.info('Landing view layout activated');
    }

    /**
	 * Disable the landing view layout (hide the window).
	 *
	 * @see sources/win63_version/habbo/friendbar/landingview/layout/WidgetContainerLayout.as disable()
	 */
    public disable(): void
    {
        if(this._window != null)
        {
            this._window.visible = false;
        }
    }

    /**
	 * Dispose this layout and its window.
	 *
	 * @see sources/win63_version/habbo/friendbar/landingview/layout/WidgetContainerLayout.as dispose()
	 */
    public dispose(): void
    {
        this._landingView = null;

        if(this._window)
        {
            this._window.dispose();
            this._window = null;
        }
    }

    /**
	 * Create the main landing view window from the layout.
	 *
	 * Builds the window from the registered widget layout JSON and adds it
	 * to the BACKGROUND layer (0).
	 *
	 * @see sources/win63_version/habbo/friendbar/landingview/layout/WidgetContainerLayout.as createWindow()
	 */
    protected createWindow(): void
    {
        if(this._window != null)
        {
            return;
        }

        const layoutName = this.getLayout();
        const built = this._landingView!.getXmlWindow(layoutName, 0);

        this._window = built as IWindowContainer;

        if(!this._window)
        {
            log.error(`Failed to build landing view window from layout: ${layoutName}`);
            return;
        }

        // Hide warning element if present
        const warning = this._window.findChildByName('warning');

        if(warning)
        {
            warning.visible = false;
        }

        // Store original window size
        this._orgWindowWidth = this._window.width;
        this._orgWindowHeight = this._window.height;

        log.info(`Landing view window created from layout: ${layoutName}`);
    }

    /**
	 * Resize the window to fill the desktop.
	 *
	 * Uses the custom layout resize (center and fill) since dynamic widget
	 * layout is not yet implemented.
	 *
	 * @see sources/win63_version/habbo/friendbar/landingview/layout/WidgetContainerLayout.as resizeWindow()
	 */
    protected resizeWindow(): void
    {
        if(this._window == null)
        {
            return;
        }

        this.resizeCustomLayout();
        this._window.invalidate();
    }

    /**
	 * Handle desktop resize event.
	 *
	 * @see sources/win63_version/habbo/friendbar/landingview/layout/WidgetContainerLayout.as onDesktopResized()
	 */
    protected onDesktopResized = (_event: unknown): void =>
    {
        this.resizeWindow();
    };

    /**
	 * Get the layout name from configuration, or use the default.
	 *
	 * @see sources/win63_version/habbo/friendbar/landingview/layout/WidgetContainerLayout.as getLayout()
	 */
    private getLayout(): string
    {
        if(this._landingView && this._landingView.propertyExists('landing.view.layoutxml'))
        {
            return this._landingView.getProperty('landing.view.layoutxml');
        }

        return DEFAULT_LAYOUT;
    }

    /**
	 * Resize using custom (non-dynamic) layout rules.
	 *
	 * Stretches the window to fill the desktop. Children with relative
	 * scale params (STRETCH/MOVE/CENTER) will auto-adjust via the
	 * WE_PARENT_RESIZED propagation.
	 *
	 * @see sources/win63_version/habbo/friendbar/landingview/layout/WidgetContainerLayout.as resizeCustomLayout()
	 */
    private resizeCustomLayout(): void
    {
        if(!this._window || !this._window.desktop)
        {
            return;
        }

        const rect = this._window.desktop.rectangle;

        this._window.x = 0;
        this._window.y = 0;
        this._window.width = rect.width;
        this._window.height = rect.height;
    }
}

import type {IRarityItemGridOverlayWidget} from './IRarityItemGridOverlayWidget';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {IHabboWindowManager} from '../IHabboWindowManager';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {PropertyStruct} from '@core/window/utils/PropertyStruct';

/**
 * Rarity item grid overlay widget.
 *
 * Displays a rarity level overlay on grid items, showing the
 * rarity number as a bitmap.
 *
 * @see sources/win63_version/habbo/window/widgets/RarityItemGridOverlayWidget.as
 */
export class RarityItemGridOverlayWidget implements IRarityItemGridOverlayWidget
{
    public static readonly TYPE: string = 'rarity_item_overlay_grid';

    private _widgetWindow: IWidgetWindow | null = null;
    private _windowManager: IHabboWindowManager | null = null;

    private _root: IWindowContainer | null = null;
    private _plaqueBitmap: IWindow | null = null;

    constructor(window: IWidgetWindow, windowManager: IHabboWindowManager)
    {
        this._widgetWindow = window;
        this._windowManager = windowManager;

        const root = this._windowManager.buildWidgetLayout('rarity_item_overlay_griditem') as IWindowContainer | null;

        if(root)
        {
            this._root = root;
            this._plaqueBitmap = root.findChildByName('rarity_item_overlay_plaque_background_bitmap');

            this._widgetWindow.rootWindow = root as unknown as IWindow;
        }
    }

    private _disposed: boolean = false;

    public get disposed(): boolean
    {
        return this._disposed;
    }

    private _rarityLevel: number = 0;

    public get rarityLevel(): number
    {
        return this._rarityLevel;
    }

    public set rarityLevel(value: number)
    {
        this._rarityLevel = value;
    }

    public get properties(): PropertyStruct[]
    {
        return [];
    }

    public set properties(_values: PropertyStruct[])
    {
        // AS3: properties setter is a no-op for this widget
    }

    public dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;

        this._plaqueBitmap = null;

        if(this._root)
        {
            this._root.dispose();
            this._root = null;
        }

        if(this._widgetWindow)
        {
            this._widgetWindow.rootWindow = null;
        }

        this._widgetWindow = null;
        this._windowManager = null;
    }
}

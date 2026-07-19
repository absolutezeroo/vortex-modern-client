import type {ILimitedItemGridOverlayWidget} from './ILimitedItemGridOverlayWidget';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {IHabboWindowManager} from '../IHabboWindowManager';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IWindow} from '@core/window/IWindow';
import type {PropertyStruct} from '@core/window/utils/PropertyStruct';

/**
 * Limited item grid overlay widget.
 *
 * Displays a limited edition overlay on grid items, showing the
 * serial number. Supports a shine animation effect that plays
 * periodically.
 *
 * In the AS3 version, implements IUpdateReceiver for the animation
 * loop and uses BitmapData for the shine effect. In the TypeScript
 * port, animation state is stored for the UI layer.
 *
 * @see sources/win63_version/habbo/window/widgets/LimitedItemGridOverlayWidget.as
 */
export class LimitedItemGridOverlayWidget implements ILimitedItemGridOverlayWidget 
{
    public static readonly TYPE: string = 'limited_item_overlay_grid';

    private readonly _shineIntervalMs: number = 10000;
    private readonly _shineLengthMs: number = 250;

    private _widgetWindow: IWidgetWindow | null = null;
    private _windowManager: IHabboWindowManager | null = null;
    private _root: IWindowContainer | null = null;
    private _plaqueBitmap: IWindow | null = null;

    constructor(window: IWidgetWindow, windowManager: IHabboWindowManager) 
    {
        this._widgetWindow = window;
        this._windowManager = windowManager;

        const root = this._windowManager.buildWidgetLayout('unique_item_overlay_griditem_xml') as IWindowContainer | null;

        if(root) 
        {
            this._root = root;

            const plaqueBitmap = root.findChildByName('unique_item_overlay_plaque_background_bitmap');

            if(plaqueBitmap) 
            {
                this._plaqueBitmap = plaqueBitmap;
            }

            this._widgetWindow.rootWindow = this._root as unknown as IWindow;
        }
    }

    private _disposed: boolean = false;

    public get disposed(): boolean 
    {
        return this._disposed;
    }

    private _serialNumber: number = 0;

    public get serialNumber(): number 
    {
        return this._serialNumber;
    }

    public set serialNumber(value: number) 
    {
        this._serialNumber = value;
    }

    private _seriesSize: number = 0;

    public get seriesSize(): number 
    {
        return this._seriesSize;
    }

    public set seriesSize(_value: number) 
    {
        // AS3: seriesSize setter is a no-op for grid overlay
    }

    private _animated: boolean = false;

    public get animated(): boolean 
    {
        return this._animated;
    }

    public set animated(value: boolean) 
    {
        this._animated = value;
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

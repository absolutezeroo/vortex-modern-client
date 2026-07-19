import type {IWidget} from './IWidget';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {IHabboWindowManager} from '../IHabboWindowManager';
import type {IWindow} from '@core/window/IWindow';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import {PropertyStruct} from '@core/window/utils/PropertyStruct';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {WindowEventListener} from '@core/window/events/WindowEventDispatcher';

/**
 * Hover bitmap effect widget.
 *
 * Displays a bitmap that switches between a normal and hover asset
 * based on mouse interaction state.
 *
 * In the AS3 version, uses IStaticBitmapWrapperWindow and mouse events.
 * The bitmap IS the rootWindow (no IWindowContainer wrapper).
 *
 * @see sources/win63_version/habbo/window/widgets/HoverBitmapWidget.as
 */
export class HoverBitmapWidget implements IWidget
{
    public static readonly TYPE: string = 'hover_bitmap';

    private static readonly HOVER_ASSET_KEY: string = 'hover_bitmap:hover_asset';
    private static readonly NORMAL_ASSET_KEY: string = 'hover_bitmap:normal_asset';

    private _widgetWindow: IWidgetWindow | null = null;
    private _windowManager: IHabboWindowManager | null = null;
    private _bitmap: IStaticBitmapWrapperWindow | null = null;

    private _onMouseOverBound: WindowEventListener;
    private _onMouseOutBound: WindowEventListener;

    constructor(window: IWidgetWindow, windowManager: IHabboWindowManager)
    {
        this._widgetWindow = window;
        this._windowManager = windowManager;

        this._onMouseOverBound = this.onMouseOver.bind(this);
        this._onMouseOutBound = this.onMouseOut.bind(this);

        const bitmap = this._windowManager.buildWidgetLayout('hover_bitmap_xml') as IStaticBitmapWrapperWindow | null;

        if(bitmap)
        {
            this._bitmap = bitmap;

            this._bitmap.addEventListener(WindowMouseEvent.OVER, this._onMouseOverBound);
            this._bitmap.addEventListener(WindowMouseEvent.OUT, this._onMouseOutBound);

            this._widgetWindow.rootWindow = this._bitmap as unknown as IWindow;
            this._bitmap.width = this._widgetWindow.width;
            this._bitmap.height = this._widgetWindow.height;
            this._bitmap.invalidate();
        }
    }

    private _disposed: boolean = false;

    public get disposed(): boolean
    {
        return this._disposed;
    }

    private _normalAsset: string = '';

    public get normalAsset(): string
    {
        return this._normalAsset;
    }

    public set normalAsset(value: string)
    {
        this._normalAsset = value;

        if(!this._isHovering && this._bitmap)
        {
            this._bitmap.assetUri = value;
        }
    }

    private _hoverAsset: string = '';

    public get hoverAsset(): string
    {
        return this._hoverAsset;
    }

    public set hoverAsset(value: string)
    {
        this._hoverAsset = value;

        if(this._isHovering && this._bitmap)
        {
            this._bitmap.assetUri = value;
        }
    }

    private _isHovering: boolean = false;

    /**
	 * Whether the widget is currently in hover state.
	 */
    public get isHovering(): boolean
    {
        return this._isHovering;
    }

    public set isHovering(value: boolean)
    {
        this._isHovering = value;
    }

    /**
	 * The current asset URI based on hover state.
	 */
    public get currentAsset(): string
    {
        return this._isHovering ? this._hoverAsset : this._normalAsset;
    }

    public get properties(): PropertyStruct[]
    {
        if(this._disposed) return [];

        const result: PropertyStruct[] = [
            new PropertyStruct(HoverBitmapWidget.NORMAL_ASSET_KEY, this._normalAsset),
            new PropertyStruct(HoverBitmapWidget.HOVER_ASSET_KEY, this._hoverAsset),
        ];

        if(this._bitmap)
        {
            const bitmapProps = (this._bitmap as IWindow).properties as PropertyStruct[];

            if(bitmapProps)
            {
                for(const prop of bitmapProps)
                {
                    if(prop.key !== 'asset_uri')
                    {
                        result.push(prop);
                    }
                }
            }
        }

        return result;
    }

    public set properties(values: PropertyStruct[])
    {
        for(const prop of values)
        {
            switch(prop.key)
            {
                case HoverBitmapWidget.NORMAL_ASSET_KEY:
                    this.normalAsset = String(prop.value);
                    break;
                case HoverBitmapWidget.HOVER_ASSET_KEY:
                    this.hoverAsset = String(prop.value);
                    break;
            }
        }

        if(this._bitmap)
        {
            (this._bitmap as IWindow).properties = values;
            this._bitmap.invalidate();
        }
    }

    public dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;

        if(this._bitmap)
        {
            this._bitmap.removeEventListener(WindowMouseEvent.OVER, this._onMouseOverBound);
            this._bitmap.removeEventListener(WindowMouseEvent.OUT, this._onMouseOutBound);
            this._bitmap.dispose();
            this._bitmap = null;
        }

        if(this._widgetWindow)
        {
            this._widgetWindow.rootWindow = null;
        }

        this._widgetWindow = null;
        this._windowManager = null;
    }

    /**
	 * Handle mouse over event. Switches to hover asset.
	 */
    private onMouseOver(): void
    {
        this._isHovering = true;

        if(this._bitmap)
        {
            this._bitmap.assetUri = this._hoverAsset;
        }
    }

    /**
	 * Handle mouse out event. Switches to normal asset.
	 */
    private onMouseOut(): void
    {
        this._isHovering = false;

        if(this._bitmap)
        {
            this._bitmap.assetUri = this._normalAsset;
        }
    }
}

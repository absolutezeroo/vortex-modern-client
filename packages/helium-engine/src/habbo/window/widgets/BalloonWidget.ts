import type {IWidget} from './IWidget';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {IHabboWindowManager} from '../IHabboWindowManager';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import {PropertyStruct} from '@core/window/utils/PropertyStruct';
import {WindowEvent} from '@core/window/events/WindowEvent';

/**
 * Balloon / speech bubble widget.
 *
 * Renders a balloon shape with an arrow pointer positioned relative to
 * the balloon body. Supports arrow pivot placement (up/down/left/right,
 * minimum/middle/maximum) and displacement offset.
 *
 * In the AS3 version, uses IStaticBitmapWrapperWindow for arrow rendering
 * and IWindowContainer for the border. In the TypeScript port, balloon
 * layout metadata is stored for the UI layer.
 *
 * @see sources/win63_version/habbo/window/widgets/BalloonWidget.as
 */
export class BalloonWidget implements IWidget
{
    public static readonly TYPE: string = 'balloon';

    private static readonly ARROW_PIVOT_KEY: string = 'balloon:arrow_pivot';
    private static readonly ARROW_DISPLACEMENT_KEY: string = 'balloon:arrow_displacement';
    private static readonly ARROW_FREE_PADDING: number = 6;
    private static readonly ARROW_LENGTH: number = 6;
    private static readonly ARROW_WIDTH: number = 9;

    private static readonly PARAM_FLAG_131072: number = 131072;
    private static readonly PARAM_FLAG_147456: number = 147456;

    private _batchUpdate: boolean = false;

    private _widgetWindow: IWidgetWindow | null = null;
    private _windowManager: IHabboWindowManager | null = null;

    private _root: IWindowContainer | null = null;
    private _arrowBitmap: IWindow | null = null;
    private _border: IWindowContainer | null = null;

    private _onChangeBound: Function;

    constructor(window: IWidgetWindow, windowManager: IHabboWindowManager)
    {
        this._widgetWindow = window;
        this._windowManager = windowManager;

        this._onChangeBound = this.onChange.bind(this);

        const root = this._windowManager.buildWidgetLayout('balloon_xml') as IWindowContainer | null;

        if(root)
        {
            this._root = root;
            this._arrowBitmap = root.findChildByName('bitmap');
            this._border = root.findChildByName('border') as IWindowContainer | null;

            this.syncFlags();

            this._widgetWindow.addEventListener(WindowEvent.WE_RESIZE, this._onChangeBound);
            this._widgetWindow.addEventListener(WindowEvent.WE_RESIZED, this._onChangeBound);

            if(this._border)
            {
                this._border.addEventListener(WindowEvent.WE_RESIZE, this._onChangeBound);
                this._border.addEventListener(WindowEvent.WE_RESIZED, this._onChangeBound);
            }

            this._widgetWindow.rootWindow = root as unknown as IWindow;
            root.width = this._widgetWindow.width;
            root.height = this._widgetWindow.height;
        }
    }

    private _disposed: boolean = false;

    public get disposed(): boolean
    {
        return this._disposed;
    }

    private _arrowPivot: string = 'up, center';

    public get arrowPivot(): string
    {
        return this._arrowPivot;
    }

    public set arrowPivot(value: string)
    {
        this._arrowPivot = value;
    }

    private _arrowDisplacement: number = 0;

    public get arrowDisplacement(): number
    {
        return this._arrowDisplacement;
    }

    public set arrowDisplacement(value: number)
    {
        this._arrowDisplacement = value;
    }

    /**
	 * Returns the border's iterator if available.
	 */
    public get iterator(): unknown
    {
        if(this._border)
        {
            return this._border.iterator;
        }

        return null;
    }

    public get properties(): PropertyStruct[]
    {
        if(this._disposed) return [];

        return [
            new PropertyStruct(BalloonWidget.ARROW_PIVOT_KEY, this._arrowPivot),
            new PropertyStruct(BalloonWidget.ARROW_DISPLACEMENT_KEY, this._arrowDisplacement),
        ];
    }

    public set properties(values: PropertyStruct[])
    {
        this._batchUpdate = true;

        for(const prop of values)
        {
            switch(prop.key)
            {
                case BalloonWidget.ARROW_PIVOT_KEY:
                    this.arrowPivot = String(prop.value);
                    break;
                case BalloonWidget.ARROW_DISPLACEMENT_KEY:
                    this.arrowDisplacement = Number(prop.value);
                    break;
            }
        }

        this._batchUpdate = false;
    }

    public dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;

        if(this._widgetWindow)
        {
            this._widgetWindow.removeEventListener(WindowEvent.WE_RESIZE, this._onChangeBound);
            this._widgetWindow.removeEventListener(WindowEvent.WE_RESIZED, this._onChangeBound);
        }

        if(this._border)
        {
            this._border.removeEventListener(WindowEvent.WE_RESIZE, this._onChangeBound);
            this._border.removeEventListener(WindowEvent.WE_RESIZED, this._onChangeBound);
            this._border = null;
        }

        this._arrowBitmap = null;

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

    /**
	 * Sync param flags from widgetWindow to border.
	 */
    private syncFlags(): void
    {
        if(!this._widgetWindow || !this._border) return;

        const widgetWindow = this._widgetWindow as IWindow;
        const border = this._border as IWindow;

        if(widgetWindow.getParamFlag(BalloonWidget.PARAM_FLAG_131072))
        {
            border.setParamFlag(BalloonWidget.PARAM_FLAG_131072, true);
        }

        if(widgetWindow.getParamFlag(BalloonWidget.PARAM_FLAG_147456))
        {
            border.setParamFlag(BalloonWidget.PARAM_FLAG_147456, true);
        }
    }

    /**
	 * Clear param flags from border.
	 */
    private clearFlags(): void
    {
        if(!this._border) return;

        const border = this._border as IWindow;

        border.setParamFlag(BalloonWidget.PARAM_FLAG_131072, false);
        border.setParamFlag(BalloonWidget.PARAM_FLAG_147456, false);
    }

    /**
	 * Handle resize events. Calls refresh to reposition the arrow.
	 */
    private onChange(): void
    {
        this.refresh();
    }

    /**
	 * Refresh arrow positioning.
	 *
	 * Complex arrow positioning logic from AS3 - stub for now,
	 * the UI layer handles visual rendering.
	 */
    private refresh(): void
    {
        // TODO: Implement full arrow positioning logic from AS3
    }
}

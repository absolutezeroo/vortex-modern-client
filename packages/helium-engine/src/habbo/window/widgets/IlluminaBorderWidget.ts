import type {IIlluminaBorderWidget} from './IIlluminaBorderWidget';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {IHabboWindowManager} from '../IHabboWindowManager';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import {PropertyStruct} from '@core/window/utils/PropertyStruct';
import {WindowEvent} from '@core/window/events/WindowEvent';

/**
 * Illumina theme border widget.
 *
 * Renders a 9-slice border from named assets, with configurable
 * content padding, side padding, child margin, and named child
 * positioning in top/bottom slots.
 *
 * In the AS3 version, uses BitmapData drawing with Matrix transforms
 * for the 9-slice rendering. In the TypeScript port, border configuration
 * is stored for CSS-based rendering by the UI layer.
 *
 * @see sources/win63_version/habbo/window/widgets/IlluminaBorderWidget.as
 */
export class IlluminaBorderWidget implements IIlluminaBorderWidget
{
    public static readonly TYPE: string = 'illumina_border';

    public static readonly BORDER_STYLE_ILLUMINA_LIGHT: string = 'illumina_light';
    public static readonly BORDER_STYLE_ILLUMINA_DARK: string = 'illumina_dark';
    public static readonly BORDER_STYLES: string[] = ['illumina_light', 'illumina_dark'];

    private static readonly BORDER_STYLE_KEY: string = 'illumina_border:border_style';
    private static readonly CONTENT_CHILD_KEY: string = 'illumina_border:content_child';
    private static readonly CONTENT_PADDING_KEY: string = 'illumina_border:content_padding';
    private static readonly SIDE_PADDING_KEY: string = 'illumina_border:side_padding';
    private static readonly CHILD_MARGIN_KEY: string = 'illumina_border:child_margin';
    private static readonly TOP_LEFT_CHILD_KEY: string = 'illumina_border:top_left_child';
    private static readonly TOP_CENTER_CHILD_KEY: string = 'illumina_border:top_center_child';
    private static readonly TOP_RIGHT_CHILD_KEY: string = 'illumina_border:top_right_child';
    private static readonly BOTTOM_LEFT_CHILD_KEY: string = 'illumina_border:bottom_left_child';
    private static readonly BOTTOM_CENTER_CHILD_KEY: string = 'illumina_border:bottom_center_child';
    private static readonly BOTTOM_RIGHT_CHILD_KEY: string = 'illumina_border:bottom_right_child';
    private static readonly LANDING_VIEW_MODE_KEY: string = 'illumina_border:landing_view_mode';

    private static readonly BORDER_PIECES: string[] = [
        'top_left', 'top_center', 'top_right', 'center_right',
        'bottom_right', 'bottom_center', 'bottom_left', 'center_left'
    ];

    private _batchUpdate: boolean = false;
    private _widgetWindow: IWidgetWindow | null = null;
    private _windowManager: IHabboWindowManager | null = null;

    private _root: IWindowContainer | null = null;
    private _canvas: IWindow | null = null;
    private _children: IWindowContainer | null = null;

    private _onChangeBound: Function;

    constructor(window: IWidgetWindow, windowManager: IHabboWindowManager)
    {
        this._widgetWindow = window;
        this._windowManager = windowManager;

        this._onChangeBound = this.onChange.bind(this);

        const root = this._windowManager.buildWidgetLayout('illumina_border_xml') as IWindowContainer | null;

        if(root)
        {
            this._root = root;
            this._canvas = root.findChildByName('canvas');
            this._children = root.findChildByName('children') as IWindowContainer | null;

            if(this._canvas)
            {
                this._canvas.addEventListener(WindowEvent.WE_RESIZE, this._onChangeBound);
                this._canvas.addEventListener(WindowEvent.WE_RESIZED, this._onChangeBound);
            }

            if(this._children)
            {
                this._children.addEventListener(WindowEvent.WE_CHILD_ADDED, this._onChangeBound);
                this._children.addEventListener(WindowEvent.WE_CHILD_REMOVED, this._onChangeBound);
                this._children.addEventListener(WindowEvent.WE_CHILD_RELOCATED, this._onChangeBound);
                this._children.addEventListener(WindowEvent.WE_CHILD_RESIZED, this._onChangeBound);
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

    private _borderStyle: string = '';

    public get borderStyle(): string
    {
        return this._borderStyle;
    }

    public set borderStyle(value: string)
    {
        this._borderStyle = value;
    }

    private _contentChild: string = '';

    public get contentChild(): string
    {
        return this._contentChild;
    }

    public set contentChild(value: string)
    {
        this._contentChild = value ?? '';
    }

    private _contentPadding: number = 5;

    public get contentPadding(): number
    {
        return this._contentPadding;
    }

    public set contentPadding(value: number)
    {
        this._contentPadding = value;
    }

    private _sidePadding: number = 15;

    public get sidePadding(): number
    {
        return this._sidePadding;
    }

    public set sidePadding(value: number)
    {
        this._sidePadding = value;
    }

    private _childMargin: number = 3;

    public get childMargin(): number
    {
        return this._childMargin;
    }

    public set childMargin(value: number)
    {
        this._childMargin = value;
    }

    private _topLeftChild: string = '';

    public get topLeftChild(): string
    {
        return this._topLeftChild;
    }

    public set topLeftChild(value: string)
    {
        this._topLeftChild = value ?? '';
    }

    private _topCenterChild: string = '';

    public get topCenterChild(): string
    {
        return this._topCenterChild;
    }

    public set topCenterChild(value: string)
    {
        this._topCenterChild = value ?? '';
    }

    private _topRightChild: string = '';

    public get topRightChild(): string
    {
        return this._topRightChild;
    }

    public set topRightChild(value: string)
    {
        this._topRightChild = value ?? '';
    }

    private _bottomLeftChild: string = '';

    public get bottomLeftChild(): string
    {
        return this._bottomLeftChild;
    }

    public set bottomLeftChild(value: string)
    {
        this._bottomLeftChild = value ?? '';
    }

    private _bottomCenterChild: string = '';

    public get bottomCenterChild(): string
    {
        return this._bottomCenterChild;
    }

    public set bottomCenterChild(value: string)
    {
        this._bottomCenterChild = value ?? '';
    }

    private _bottomRightChild: string = '';

    public get bottomRightChild(): string
    {
        return this._bottomRightChild;
    }

    public set bottomRightChild(value: string)
    {
        this._bottomRightChild = value ?? '';
    }

    private _landingViewMode: boolean = false;

    public get landingViewMode(): boolean
    {
        return this._landingViewMode;
    }

    public set landingViewMode(value: boolean)
    {
        this._landingViewMode = value;
    }

    /**
	 * Returns the children container's iterator if available.
	 */
    public get iterator(): unknown
    {
        if(this._children)
        {
            return this._children.iterator;
        }

        return null;
    }

    public get properties(): PropertyStruct[]
    {
        if(this._disposed) return [];

        return [
            new PropertyStruct(IlluminaBorderWidget.BORDER_STYLE_KEY, this._borderStyle),
            new PropertyStruct(IlluminaBorderWidget.CONTENT_CHILD_KEY, this._contentChild),
            new PropertyStruct(IlluminaBorderWidget.CONTENT_PADDING_KEY, this._contentPadding),
            new PropertyStruct(IlluminaBorderWidget.SIDE_PADDING_KEY, this._sidePadding),
            new PropertyStruct(IlluminaBorderWidget.CHILD_MARGIN_KEY, this._childMargin),
            new PropertyStruct(IlluminaBorderWidget.TOP_LEFT_CHILD_KEY, this._topLeftChild),
            new PropertyStruct(IlluminaBorderWidget.TOP_CENTER_CHILD_KEY, this._topCenterChild),
            new PropertyStruct(IlluminaBorderWidget.TOP_RIGHT_CHILD_KEY, this._topRightChild),
            new PropertyStruct(IlluminaBorderWidget.BOTTOM_LEFT_CHILD_KEY, this._bottomLeftChild),
            new PropertyStruct(IlluminaBorderWidget.BOTTOM_CENTER_CHILD_KEY, this._bottomCenterChild),
            new PropertyStruct(IlluminaBorderWidget.BOTTOM_RIGHT_CHILD_KEY, this._bottomRightChild),
            new PropertyStruct(IlluminaBorderWidget.LANDING_VIEW_MODE_KEY, this._landingViewMode),
        ];
    }

    public set properties(values: PropertyStruct[])
    {
        this._batchUpdate = true;

        for(const prop of values)
        {
            switch(prop.key)
            {
                case IlluminaBorderWidget.BORDER_STYLE_KEY:
                    this.borderStyle = String(prop.value);
                    break;
                case IlluminaBorderWidget.CONTENT_CHILD_KEY:
                    this.contentChild = String(prop.value);
                    break;
                case IlluminaBorderWidget.CONTENT_PADDING_KEY:
                    this.contentPadding = Number(prop.value);
                    break;
                case IlluminaBorderWidget.SIDE_PADDING_KEY:
                    this.sidePadding = Number(prop.value);
                    break;
                case IlluminaBorderWidget.CHILD_MARGIN_KEY:
                    this.childMargin = Number(prop.value);
                    break;
                case IlluminaBorderWidget.TOP_LEFT_CHILD_KEY:
                    this.topLeftChild = String(prop.value);
                    break;
                case IlluminaBorderWidget.TOP_CENTER_CHILD_KEY:
                    this.topCenterChild = String(prop.value);
                    break;
                case IlluminaBorderWidget.TOP_RIGHT_CHILD_KEY:
                    this.topRightChild = String(prop.value);
                    break;
                case IlluminaBorderWidget.BOTTOM_LEFT_CHILD_KEY:
                    this.bottomLeftChild = String(prop.value);
                    break;
                case IlluminaBorderWidget.BOTTOM_CENTER_CHILD_KEY:
                    this.bottomCenterChild = String(prop.value);
                    break;
                case IlluminaBorderWidget.BOTTOM_RIGHT_CHILD_KEY:
                    this.bottomRightChild = String(prop.value);
                    break;
                case IlluminaBorderWidget.LANDING_VIEW_MODE_KEY:
                    this.landingViewMode = Boolean(prop.value);
                    break;
            }
        }

        this._batchUpdate = false;
    }

    public dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;

        if(this._canvas)
        {
            this._canvas.removeEventListener(WindowEvent.WE_RESIZE, this._onChangeBound);
            this._canvas.removeEventListener(WindowEvent.WE_RESIZED, this._onChangeBound);
            this._canvas = null;
        }

        if(this._children)
        {
            this._children.removeEventListener(WindowEvent.WE_CHILD_ADDED, this._onChangeBound);
            this._children.removeEventListener(WindowEvent.WE_CHILD_REMOVED, this._onChangeBound);
            this._children.removeEventListener(WindowEvent.WE_CHILD_RELOCATED, this._onChangeBound);
            this._children.removeEventListener(WindowEvent.WE_CHILD_RESIZED, this._onChangeBound);
            this._children = null;
        }

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
	 * Handle change events. Calls refresh to redraw the border.
	 */
    private onChange(): void
    {
        this.refresh();
    }

    /**
	 * Refresh the border rendering.
	 *
	 * Border drawing is handled by the CSS layer in the TypeScript port.
	 */
    private refresh(): void
    {
        // TODO: Border drawing stub - CSS layer handles it
    }
}

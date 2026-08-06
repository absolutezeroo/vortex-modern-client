import type {ISeparatorWidget} from './ISeparatorWidget';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {IHabboWindowManager} from '../IHabboWindowManager';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IWindow} from '@core/window/IWindow';
import {PropertyStruct} from '@core/window/utils/PropertyStruct';
import {WindowEvent} from '@core/window/events/WindowEvent';
import type {WindowEventListener} from '@core/window/events/WindowEventDispatcher';

/**
 * Visual separator widget.
 *
 * Renders a separator line (horizontal or vertical) using tiled
 * border images. Child windows punch holes through the separator line.
 *
 * In the AS3 version, uses BitmapData with tiled copyPixels and
 * fillRect for the punch-through effect. In the TypeScript port,
 * separator state is stored for CSS-based rendering by the UI layer.
 *
 * @see sources/win63_version/habbo/window/widgets/SeparatorWidget.as
 */
export class SeparatorWidget implements ISeparatorWidget 
{
    // AS3: sources/win63_version/habbo/window/widgets/SeparatorWidget.as::TYPE
    public static readonly TYPE: string = 'separator';

    // AS3: sources/win63_version/habbo/window/widgets/SeparatorWidget.as::VERTICAL_KEY
    private static readonly VERTICAL_KEY: string = 'separator:vertical';
    // AS3: sources/win63_version/habbo/window/widgets/SeparatorWidget.as::BORDER_IMAGE_HORIZONTAL
    private static readonly BORDER_IMAGE_HORIZONTAL: string = 'illumina_light_separator_horizontal';
    // AS3: sources/win63_version/habbo/window/widgets/SeparatorWidget.as::BORDER_IMAGE_VERTICAL
    private static readonly BORDER_IMAGE_VERTICAL: string = 'illumina_light_separator_vertical';

    private _widgetWindow: IWidgetWindow | null = null;
    // AS3: sources/win63_version/habbo/window/widgets/SeparatorWidget.as::_windowManager
    private _windowManager: IHabboWindowManager | null = null;
    private _root: IWindowContainer | null = null;
    private _canvas: IWindow | null = null;
    // AS3: sources/win63_version/habbo/window/widgets/SeparatorWidget.as::_children
    private _children: IWindowContainer | null = null;

    private _onChangeBound: WindowEventListener;

    constructor(window: IWidgetWindow, windowManager: IHabboWindowManager) 
    {
        this._widgetWindow = window;
        this._windowManager = windowManager;

        this._onChangeBound = this.onChange.bind(this);

        const root = this._windowManager.buildWidgetLayout('separator_xml') as IWindowContainer | null;

        if(root) 
        {
            this._root = root;

            const canvas = root.getChildByName('canvas');
            const children = root.getChildByName('children') as IWindowContainer | null;

            if(canvas) 
            {
                this._canvas = canvas;

                this._canvas.addEventListener(WindowEvent.WE_RESIZE, this._onChangeBound);
                this._canvas.addEventListener(WindowEvent.WE_RESIZED, this._onChangeBound);
            }

            if(children) 
            {
                this._children = children;

                this._children.addEventListener(WindowEvent.WE_CHILD_ADDED, this._onChangeBound);
                this._children.addEventListener(WindowEvent.WE_CHILD_REMOVED, this._onChangeBound);
                this._children.addEventListener(WindowEvent.WE_CHILD_RELOCATED, this._onChangeBound);
                this._children.addEventListener(WindowEvent.WE_CHILD_RESIZED, this._onChangeBound);
            }

            this._widgetWindow.rootWindow = this._root as unknown as IWindow;
            this._root.width = this._widgetWindow.width;
            this._root.height = this._widgetWindow.height;
        }
    }

    // AS3: sources/win63_version/habbo/window/widgets/SeparatorWidget.as::_disposed
    private _disposed: boolean = false;

    // AS3: sources/win63_version/habbo/window/widgets/SeparatorWidget.as::get disposed()
    public get disposed(): boolean 
    {
        return this._disposed;
    }

    private _vertical: boolean = false;

    // AS3: sources/win63_version/habbo/window/widgets/SeparatorWidget.as::get vertical()
    public get vertical(): boolean 
    {
        return this._vertical;
    }

    // AS3: sources/win63_version/habbo/window/widgets/SeparatorWidget.as::set vertical()
    public set vertical(value: boolean) 
    {
        this._vertical = value;
    }

    /**
     * Get the border image asset name for the current orientation.
     */
    public get borderImageName(): string 
    {
        return this._vertical
            ? SeparatorWidget.BORDER_IMAGE_VERTICAL
            : SeparatorWidget.BORDER_IMAGE_HORIZONTAL;
    }

    // AS3: sources/win63_version/habbo/window/widgets/SeparatorWidget.as::get properties()
    public get properties(): PropertyStruct[] 
    {
        if(this._disposed) return [];

        return [
            new PropertyStruct(SeparatorWidget.VERTICAL_KEY, this._vertical),
        ];
    }

    // AS3: sources/win63_version/habbo/window/widgets/SeparatorWidget.as::set properties()
    public set properties(values: PropertyStruct[]) 
    {
        for(const prop of values) 
        {
            if(prop.key === SeparatorWidget.VERTICAL_KEY) 
            {
                this.vertical = Boolean(prop.value);
            }
        }
    }

    // AS3: sources/win63_version/habbo/window/widgets/SeparatorWidget.as::dispose()
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
     * Called when the canvas resizes or children change.
     * Triggers a refresh of the separator rendering.
     */
    // AS3: sources/win63_version/habbo/window/widgets/SeparatorWidget.as::onChange()
    private onChange(): void 
    {
        this.refresh();
    }

    /**
     * Refresh the separator rendering based on current layout.
     */
    // AS3: sources/win63_version/habbo/window/widgets/SeparatorWidget.as::refresh()
    private refresh(): void 
    {
        // AS3: Redraws the separator BitmapData with tiled border images
        // and punch-through holes for children. In TS, the UI layer
        // handles rendering based on stored state.
    }
}

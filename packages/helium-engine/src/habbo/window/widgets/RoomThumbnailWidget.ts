import type {IRoomThumbnailWidget} from './IRoomThumbnailWidget';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {IHabboWindowManager} from '../IHabboWindowManager';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IWindow} from '@core/window/IWindow';
import type {PropertyStruct} from '@core/window/utils/PropertyStruct';

/**
 * Room thumbnail widget.
 *
 * Displays a thumbnail image for a room. Builds the window tree
 * from the room_thumbnail layout.
 *
 * @see sources/win63_version/habbo/window/widgets/RoomThumbnailWidget.as
 */
export class RoomThumbnailWidget implements IRoomThumbnailWidget
{
    public static readonly TYPE: string = 'room_thumbnail';

    private _widgetWindow: IWidgetWindow | null = null;
    private _windowManager: IHabboWindowManager | null = null;
    private _root: IWindowContainer | null = null;

    constructor(window: IWidgetWindow, windowManager: IHabboWindowManager)
    {
        this._widgetWindow = window;
        this._windowManager = windowManager;

        const root = this._windowManager.buildWidgetLayout('room_thumbnail') as IWindowContainer | null;

        if(root)
        {
            this._root = root;

            this._widgetWindow.rootWindow = this._root as unknown as IWindow;
            this._root.width = this._widgetWindow.width;
            this._root.height = this._widgetWindow.height;
        }
    }

    private _disposed: boolean = false;

    public get disposed(): boolean
    {
        return this._disposed;
    }

    private _flatId: number = 0;

    public get flatId(): number
    {
        return this._flatId;
    }

    public set flatId(value: number)
    {
        this._flatId = value;
    }

    public get properties(): PropertyStruct[]
    {
        return [];
    }

    public set properties(_values: PropertyStruct[])
    {
        // AS3: properties setter is a no-op for this widget
    }

    public reset(): void
    {
        this._flatId = 0;
    }

    public dispose(): void
    {
        if(this._disposed) return;

        this._disposed = true;

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

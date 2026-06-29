import type {IRoomUserCountWidget} from './IRoomUserCountWidget';
import type {IWidgetWindow} from '@core/window/components/IWidgetWindow';
import type {IHabboWindowManager} from '../IHabboWindowManager';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IWindow} from '@core/window/IWindow';
import {PropertyStruct} from '@core/window/utils/PropertyStruct';

/**
 * Room user count display widget.
 *
 * Displays the current number of users in a room. Builds the window
 * tree from the room_user_count layout.
 *
 * @see sources/win63_version/habbo/window/widgets/RoomUserCountWidget.as
 */
export class RoomUserCountWidget implements IRoomUserCountWidget
{
	public static readonly TYPE: string = 'room_user_count';

	private _widgetWindow: IWidgetWindow | null = null;
	private _windowManager: IHabboWindowManager | null = null;
	private _root: IWindowContainer | null = null;

	constructor(window: IWidgetWindow, windowManager: IHabboWindowManager)
	{
		this._widgetWindow = window;
		this._windowManager = windowManager;

		const root = this._windowManager.buildWidgetLayout('room_user_count') as IWindowContainer | null;

		if (root)
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

	private _userCount: number = 0;

	public get userCount(): number
	{
		return this._userCount;
	}

	public set userCount(value: number)
	{
		this._userCount = value;
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
		if (this._disposed) return;

		this._disposed = true;

		if (this._root)
		{
			this._root.dispose();
			this._root = null;
		}

		if (this._widgetWindow)
		{
			this._widgetWindow.rootWindow = null;
		}

		this._widgetWindow = null;
		this._windowManager = null;
	}
}

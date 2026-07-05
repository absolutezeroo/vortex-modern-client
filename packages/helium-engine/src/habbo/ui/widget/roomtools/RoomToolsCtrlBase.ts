/**
 * RoomToolsCtrlBase
 *
 * @see sources/win63_version/habbo/ui/widget/roomtools/RoomToolsCtrlBase.as
 *
 * Shared base for RoomToolsToolbarCtrl / RoomToolsInfoCtrl: owns the built
 * window, an auto-collapse timer, and setElementVisible().
 */
import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {RoomToolsWidgetHandler} from '@habbo/ui/handler/RoomToolsWidgetHandler';
import type {RoomToolsWidget} from './RoomToolsWidget';

export class RoomToolsCtrlBase
{
	// AS3: sources/win63_version/habbo/ui/widget/roomtools/RoomToolsCtrlBase.as::DISTANCE_FROM_BOTTOM
	protected static readonly DISTANCE_FROM_BOTTOM: number = 55;

	// AS3: sources/win63_version/habbo/ui/widget/roomtools/RoomToolsCtrlBase.as::TOOLBAR_X
	protected static readonly TOOLBAR_X: number = -5;

	protected _window: IWindowContainer | null = null;
	protected _widget: RoomToolsWidget | null;
	protected _windowManager: IHabboWindowManager;
	protected _assets: IAssetLibrary | null;
	protected _collapsed: boolean = true;
	private _collapseTimer: ReturnType<typeof setTimeout> | null = null;
	private _collapsePending: boolean = false;
	private _collapseDelay: number;

	// AS3: sources/win63_version/habbo/ui/widget/roomtools/RoomToolsCtrlBase.as::RoomToolsCtrlBase()
	constructor(widget: RoomToolsWidget, windowManager: IHabboWindowManager, assets: IAssetLibrary | null)
	{
		this._widget = widget;
		this._windowManager = windowManager;
		this._assets = assets;
		this._collapseDelay = this.handler?.container?.config?.getInteger('room.enter.info.collapse.delay', 5000) ?? 5000;
	}

	// AS3: sources/win63_version/habbo/ui/widget/roomtools/RoomToolsCtrlBase.as::dispose()
	public dispose(): void
	{
		if(this._window)
		{
			this._window.procedure = null;
			this._window.dispose();
			this._window = null;
		}

		if(this._collapseTimer !== null)
		{
			clearTimeout(this._collapseTimer);
			this._collapseTimer = null;
			this._collapsePending = false;
		}

		this._widget = null;
	}

	// AS3: sources/win63_version/habbo/ui/widget/roomtools/RoomToolsCtrlBase.as::setElementVisible()
	public setElementVisible(name: string, visible: boolean): void
	{
		const child = this._window?.findChildByName(name);

		if(!this._window || !child) return;

		child.visible = visible;
	}

	// AS3: sources/win63_version/habbo/ui/widget/roomtools/RoomToolsCtrlBase.as::collapseAfterDelay()
	protected collapseAfterDelay(): void
	{
		this.clearCollapseTimer();
		this._collapseTimer = setTimeout(() => this.collapseTimerEventHandler(), this._collapseDelay);
	}

	// AS3: sources/win63_version/habbo/ui/widget/roomtools/RoomToolsCtrlBase.as::collapseIfPending()
	protected collapseIfPending(): void
	{
		if(this._collapsePending)
		{
			this.collapseAfterDelay();
		}
	}

	// AS3: sources/win63_version/habbo/ui/widget/roomtools/RoomToolsCtrlBase.as::clearCollapseTimer()
	protected clearCollapseTimer(): void
	{
		if(this._collapseTimer !== null)
		{
			clearTimeout(this._collapseTimer);
			this._collapseTimer = null;
		}

		this._collapsePending = false;
	}

	// AS3: sources/win63_version/habbo/ui/widget/roomtools/RoomToolsCtrlBase.as::collapseTimerEventHandler()
	private collapseTimerEventHandler(): void
	{
		this.clearCollapseTimer();
		this.setCollapsed(true);
	}

	// AS3: sources/win63_version/habbo/ui/widget/roomtools/RoomToolsCtrlBase.as::cancelWindowCollapse()
	protected cancelWindowCollapse(): void
	{
		if(this._collapseTimer !== null)
		{
			this.clearCollapseTimer();
			this._collapsePending = true;
		}
	}

	// AS3: sources/win63_version/habbo/ui/widget/roomtools/RoomToolsCtrlBase.as::setCollapsed()
	public setCollapsed(_value: boolean): void
	{
		// AS3 no-op — overridden by subclasses.
	}

	// AS3: sources/win63_version/habbo/ui/widget/roomtools/RoomToolsCtrlBase.as::get isCollapsed()
	public get isCollapsed(): boolean
	{
		return this._collapsed;
	}

	// AS3: sources/win63_version/habbo/ui/widget/roomtools/RoomToolsCtrlBase.as::get window()
	public get window(): IWindowContainer | null
	{
		return this._window;
	}

	// AS3: sources/win63_version/habbo/ui/widget/roomtools/RoomToolsCtrlBase.as::get handler()
	public get handler(): RoomToolsWidgetHandler | null
	{
		return this._widget ? this._widget.handler : null;
	}

	// AS3: sources/win63_version/habbo/ui/widget/roomtools/RoomToolsCtrlBase.as::set visible()
	public set visible(value: boolean)
	{
		if(this._window)
		{
			this._window.visible = value;
		}
	}
}

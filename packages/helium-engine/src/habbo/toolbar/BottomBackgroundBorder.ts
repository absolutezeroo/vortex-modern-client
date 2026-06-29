import type {HabboToolbar} from './HabboToolbar';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import {WindowEvent} from '@core/window/events/WindowEvent';

/**
 * Background border rendering for the bottom toolbar area
 *
 * In AS3 this creates a window from XML, listens for parent resize events,
 * and repositions itself along the bottom of the desktop.
 *
 * @see sources/win63_version/habbo/toolbar/BottomBackgroundBorder.as
 */
export class BottomBackgroundBorder
{
	private _window: IWindow | null = null;
	private _windowManager: IHabboWindowManager | null = null;

	constructor(toolbar: HabboToolbar)
	{
		const typedToolbar = toolbar as unknown as {
			windowManager?: IHabboWindowManager | null;
			_windowManager?: IHabboWindowManager | null;
		};

		this._windowManager = typedToolbar.windowManager ?? typedToolbar._windowManager ?? null;

		if (!this._windowManager) return;

		this._window = this._windowManager.buildWidgetLayout('bottom_background_border');

		if (this._window)
		{
			this._window.ignoreMouseEvents = true;
			this._window.procedure = this.onWindowEvent;
			this.sendToBack();
			this.updatePosition();
		}
	}

	private _disposed: boolean = false;

	/**
	 * Whether this border is disposed
	 */
	get disposed(): boolean
	{
		return this._disposed;
	}

	/**
	 * Dispose of this border
	 */
	public dispose(): void
	{
		if (this._disposed) return;

		if (this._window)
		{
			this._window.dispose();
			this._window = null;
		}

		this._windowManager = null;
		this._disposed = true;
	}

	private onWindowEvent = (event: WindowEvent): void =>
	{
		if (event.type === WindowEvent.WE_PARENT_RESIZED)
		{
			this.updatePosition();
		}
	};

	private updatePosition(): void
	{
		if (!this._window) return;

		const desktop = this._window.desktop;

		if (!desktop) return;

		this._window.position = {
			x: -10,
			y: desktop.height - (this._window.height - 3)
		};
		this._window.width = desktop.width + 20;
		this._window.invalidate();
	}

	private sendToBack(): void
	{
		if (!this._window || !this._window.parent) return;

		const parent = this._window.parent as unknown as IWindowContainer;

		if (typeof parent.setChildIndex === 'function')
		{
			parent.setChildIndex(this._window, 0);
		}
	}
}

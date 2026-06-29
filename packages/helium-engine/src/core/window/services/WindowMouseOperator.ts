import type {IWindow} from '../IWindow';
import type {WindowController} from '../WindowController';

/**
 * Base class for mouse-driven window operations (drag and scale).
 *
 * In AS3 this listened to ENTER_FRAME + stage.mouseX/Y via a
 * DisplayObject reference. In the web port, the client-side renderer
 * forwards mousemove/mouseup through {@link handleMouseMove} and
 * {@link handleMouseUp}.
 *
 * @see sources/win63_version/core/window/services/WindowMouseOperator.as
 */
export class WindowMouseOperator
{
	protected _window: WindowController | null = null;
	protected _active: boolean = false;
	protected _offset: { x: number; y: number } = {x: 0, y: 0};
	protected _mouse: { x: number; y: number } = {x: 0, y: 0};
	protected _relativePos: { x: number; y: number } = {x: 0, y: 0};
	protected _flags: number = 0;
	private _disposed: boolean = false;

	public get disposed(): boolean
	{
		return this._disposed;
	}

	/**
	 * Set the current mouse position (canvas-local coordinates).
	 *
	 * Must be called before dispatching a DOWN event so that
	 * {@link begin} can compute the correct offset.
	 *
	 * @param x - Canvas-local X
	 * @param y - Canvas-local Y
	 */
	public setMousePosition(x: number, y: number): void
	{
		this._mouse.x = x;
		this._mouse.y = y;
	}

	/**
	 * Begin a mouse operation on a window.
	 *
	 * @param window - The window to operate on
	 * @param flags - Operation flags (e.g. scaling direction)
	 * @returns The previously operated window, or null
	 */
	public begin(window: IWindow, flags: number = 0): IWindow | null
	{
		this._flags = flags;

		const previous: IWindow | null = this._window;

		if (this._window !== null)
		{
			this.end(this._window);
		}

		if (window && !window.disposed)
		{
			this._window = window as WindowController;
			this.getMousePositionRelativeTo(window, this._mouse, this._offset);
			this._active = true;
		}

		return previous;
	}

	/**
	 * End the mouse operation on a window.
	 *
	 * @param window - The window to stop operating on
	 * @returns The previously operated window, or null
	 */
	public end(window: IWindow): IWindow | null
	{
		const previous: IWindow | null = this._window;

		if (this._active)
		{
			if (this._window === window)
			{
				this._window = null;
				this._active = false;
			}
		}

		return previous;
	}

	/**
	 * Perform the mouse operation at the given coordinates.
	 *
	 * Override in subclasses for drag or scale behavior.
	 *
	 * @param x - Current mouse X (stage coordinates)
	 * @param y - Current mouse Y (stage coordinates)
	 */
	public operate(x: number, y: number): void
	{
		this._mouse.x = x;
		this._mouse.y = y;
		this.getMousePositionRelativeTo(this._window!, this._mouse, this._relativePos);
		this._window!.offset(this._relativePos.x - this._offset.x, this._relativePos.y - this._offset.y);
	}

	/**
	 * Called by the client renderer on document mousemove.
	 *
	 * @param x - Current mouse X (clientX)
	 * @param y - Current mouse Y (clientY)
	 */
	public handleMouseMove(x: number, y: number): void
	{
		if (!this._active || !this._window || this._window.disposed) return;

		if (x !== this._mouse.x || y !== this._mouse.y)
		{
			this.operate(x, y);
			this._mouse.x = x;
			this._mouse.y = y;
		}
	}

	/**
	 * Called by the client renderer on document mouseup.
	 */
	public handleMouseUp(): void
	{
		if (this._active && this._window)
		{
			this.end(this._window);
		}
	}

	/**
	 * Dispose the operator.
	 */
	public dispose(): void
	{
		this.end(this._window!);
		this._window = null;
		this._disposed = true;
	}

	/**
	 * Calculate the mouse position relative to a window.
	 *
	 * @param window - The reference window
	 * @param mousePos - The absolute mouse position
	 * @param out - The output relative position
	 */
	protected getMousePositionRelativeTo(window: IWindow, mousePos: { x: number; y: number }, out: {
		x: number;
		y: number
	}): void
	{
		window.getGlobalPosition(out);
		out.x = mousePos.x - out.x;
		out.y = mousePos.y - out.y;
	}
}

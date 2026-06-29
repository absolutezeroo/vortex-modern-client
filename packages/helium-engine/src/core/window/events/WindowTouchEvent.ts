import type {IWindow} from '../IWindow';
import {WindowEvent} from './WindowEvent';

/**
 * Window touch event with touch point coordinate and modifier data.
 *
 * Extends {@link WindowEvent} with touch-specific fields such as
 * local/stage coordinates, touch size, pressure, and modifier keys.
 * Uses its own object pool separate from the base class.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/events/WindowTouchEvent.as
 */
export class WindowTouchEvent extends WindowEvent
{
	// ── Event type constants ─────────────────────────────────────────

	public static readonly TOUCH_BEGIN: string = 'WTE_BEGIN';
	public static readonly TOUCH_END: string = 'WTE_END';
	public static readonly TOUCH_MOVE: string = 'WTE_MOVE';
	public static readonly TOUCH_OUT: string = 'WTE_OUT';
	public static readonly TOUCH_OVER: string = 'WTE_OVER';
	public static readonly TOUCH_ROLL_OUT: string = 'WTE_ROLL_OUT';
	public static readonly TOUCH_ROLL_OVER: string = 'WTE_ROLL_OVER';
	public static readonly TOUCH_TAP: string = 'WTE_TAP';

	private static readonly _touchPool: WindowTouchEvent[] = [];

	public localX: number = 0;
	public localY: number = 0;
	public stageX: number = 0;
	public stageY: number = 0;
	public altKey: boolean = false;
	public ctrlKey: boolean = false;
	public shiftKey: boolean = false;
	public pressure: number = 0;
	public sizeX: number = 0;
	public sizeY: number = 0;

	/**
	 * Allocates a WindowTouchEvent from the pool or creates a new one.
	 *
	 * @param type - The event type string
	 * @param window - The target window
	 * @param related - The related window
	 * @param localX - X coordinate relative to the target window
	 * @param localY - Y coordinate relative to the target window
	 * @param sizeX - Touch area width
	 * @param sizeY - Touch area height
	 * @param stageX - X coordinate relative to the stage
	 * @param stageY - Y coordinate relative to the stage
	 * @param pressure - Touch pressure
	 * @param altKey - Whether the Alt key is pressed
	 * @param ctrlKey - Whether the Ctrl key is pressed
	 * @param shiftKey - Whether the Shift key is pressed
	 * @returns A pooled or new WindowTouchEvent instance
	 */
	public static allocateTouch(
		type: string,
		window: IWindow | null,
		related: IWindow | null,
		localX: number = 0,
		localY: number = 0,
		sizeX: number = 0,
		sizeY: number = 0,
		stageX: number = 0,
		stageY: number = 0,
		pressure: number = 0,
		altKey: boolean = false,
		ctrlKey: boolean = false,
		shiftKey: boolean = false
	): WindowTouchEvent
	{
		const event: WindowTouchEvent = (WindowTouchEvent._touchPool.length > 0)
			? WindowTouchEvent._touchPool.pop()!
			: new WindowTouchEvent();

		event._type = type;
		event._window = window;
		event._related = related;
		event._recycled = false;
		event._poolRef = WindowTouchEvent._touchPool;
		event.localX = localX;
		event.localY = localY;
		event.sizeX = sizeX;
		event.sizeY = sizeY;
		event.stageX = stageX;
		event.stageY = stageY;
		event.pressure = pressure;
		event.altKey = altKey;
		event.ctrlKey = ctrlKey;
		event.shiftKey = shiftKey;

		return event;
	}

	/**
	 * Creates a clone of this touch event via the pool.
	 */
	public override clone(): WindowEvent
	{
		return WindowTouchEvent.allocateTouch(
			this._type, this._window, this._related,
			this.localX, this.localY, this.sizeX, this.sizeY,
			this.stageX, this.stageY, this.pressure,
			this.altKey, this.ctrlKey, this.shiftKey
		);
	}

	/**
	 * Returns a string representation of this touch event.
	 */
	public override toString(): string
	{
		return `WindowTouchEvent { type: ${this._type} cancelable: ${this._cancelable} window: ${this._window} localX: ${this.localX} localY: ${this.localY} }`;
	}
}

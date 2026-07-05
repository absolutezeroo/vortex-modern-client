import type {IWindow} from '../IWindow';
import {WindowEvent} from './WindowEvent';

/**
 * Window mouse event with coordinate and modifier key data.
 *
 * Extends {@link WindowEvent} with mouse-specific fields such as
 * local/stage coordinates, modifier keys, button state, and scroll delta.
 * Uses its own object pool separate from the base class.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/events/WindowMouseEvent.as
 */
export class WindowMouseEvent extends WindowEvent
{
    public static readonly CLICK: string = 'WME_CLICK';
    public static readonly DOUBLE_CLICK: string = `WME_DOUBLE_CLICK`;
    public static readonly DOWN: string = 'WME_DOWN';
    public static readonly MIDDLE_CLICK: string = 'WME_MIDDLE_CLICK';
    public static readonly MIDDLE_DOWN: string = 'WME_MIDDLE_DOWN';
    public static readonly MIDDLE_UP: string = 'WME_MIDDLE_UP';
    public static readonly MOVE: string = 'WME_MOVE';
    public static readonly OUT: string = 'WME_OUT';
    public static readonly OVER: string = 'WME_OVER';
    public static readonly UP: string = 'WME_UP';
    public static readonly UP_OUTSIDE: string = 'WME_UP_OUTSIDE';
    public static readonly WHEEL: string = 'WME_WHEEL';
    public static readonly RIGHT_CLICK: string = 'WME_RIGHT_CLICK';
    public static readonly RIGHT_DOWN: string = 'WME_RIGHT_DOWN';
    public static readonly RIGHT_UP: string = 'WME_RIGHT_UP';
    public static readonly ROLL_OUT: string = 'WME_ROLL_OUT';
    public static readonly ROLL_OVER: string = 'WME_ROLL_OVER';
    public static readonly HOVERING: string = 'WME_HOVERING';
    public static readonly CLICK_AWAY: string = 'WME_CLICK_AWAY';

    private static readonly _mousePool: WindowMouseEvent[] = [];

    public delta: number = 0;
    public localX: number = 0;
    public localY: number = 0;
    public stageX: number = 0;
    public stageY: number = 0;
    public altKey: boolean = false;
    public ctrlKey: boolean = false;
    public shiftKey: boolean = false;
    public buttonDown: boolean = false;

    /**
	 * Allocates a WindowMouseEvent from the pool or creates a new one.
	 *
	 * @param type - The event type string
	 * @param window - The target window
	 * @param related - The related window
	 * @param localX - X coordinate relative to the target window
	 * @param localY - Y coordinate relative to the target window
	 * @param stageX - X coordinate relative to the stage
	 * @param stageY - Y coordinate relative to the stage
	 * @param altKey - Whether the Alt key is pressed
	 * @param ctrlKey - Whether the Ctrl key is pressed
	 * @param shiftKey - Whether the Shift key is pressed
	 * @param buttonDown - Whether the mouse button is pressed
	 * @param delta - Scroll wheel delta
	 * @returns A pooled or new WindowMouseEvent instance
	 */
    public static allocateMouse(
        type: string,
        window: IWindow | null,
        related: IWindow | null,
        localX: number = 0,
        localY: number = 0,
        stageX: number = 0,
        stageY: number = 0,
        altKey: boolean = false,
        ctrlKey: boolean = false,
        shiftKey: boolean = false,
        buttonDown: boolean = false,
        delta: number = 0
    ): WindowMouseEvent
    {
        const event: WindowMouseEvent = (WindowMouseEvent._mousePool.length > 0)
            ? WindowMouseEvent._mousePool.pop()!
            : new WindowMouseEvent();

        event._type = type;
        event._window = window;
        event._related = related;
        event._cancelable = true;
        event._recycled = false;
        event._poolRef = WindowMouseEvent._mousePool;
        event.localX = localX;
        event.localY = localY;
        event.stageX = stageX;
        event.stageY = stageY;
        event.altKey = altKey;
        event.ctrlKey = ctrlKey;
        event.shiftKey = shiftKey;
        event.buttonDown = buttonDown;
        event.delta = delta;

        return event;
    }

    /**
	 * Creates a clone of this mouse event via the pool.
	 */
    public override clone(): WindowEvent
    {
        return WindowMouseEvent.allocateMouse(
            this._type, this._window, this._related,
            this.localX, this.localY, this.stageX, this.stageY,
            this.altKey, this.ctrlKey, this.shiftKey, this.buttonDown,
            this.delta
        );
    }

    /**
	 * Returns a string representation of this mouse event.
	 */
    public override toString(): string
    {
        return `WindowMouseEvent { type: ${this._type} cancelable: ${this._cancelable} window: ${this._window} localX: ${this.localX} localY: ${this.localY} }`;
    }
}

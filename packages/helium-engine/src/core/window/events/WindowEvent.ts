import type {IWindow} from '../IWindow';

/**
 * Base window event with object pooling (allocate/recycle pattern).
 *
 * All window events derive from this class. Instances are pooled for
 * performance: use the static {@link allocate} factory instead of `new`,
 * and call {@link recycle} when done.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/events/WindowEvent.as
 */
export class WindowEvent
{
	public static readonly WE_DESTROY: string = 'WE_DESTROY';
	public static readonly WE_DESTROYED: string = 'WE_DESTROYED';
	public static readonly WE_OPEN: string = 'WE_OPEN';
	public static readonly WE_OPENED: string = 'WE_OPENED';
	public static readonly WE_CLOSE: string = 'WE_CLOSE';
	public static readonly WE_CLOSED: string = 'WE_CLOSED';
	public static readonly WE_FOCUS: string = 'WE_FOCUS';
	public static readonly WE_FOCUSED: string = 'WE_FOCUSED';
	public static readonly WE_UNFOCUS: string = 'WE_UNFOCUS';
	public static readonly WE_UNFOCUSED: string = 'WE_UNFOCUSED';
	public static readonly WE_ACTIVATE: string = 'WE_ACTIVATE';
	public static readonly WE_ACTIVATED: string = 'WE_ACTIVATED';
	public static readonly WE_DEACTIVATE: string = 'WE_DEACTIVATE';
	public static readonly WE_DEACTIVATED: string = 'WE_DEACTIVATED';
	public static readonly WE_SELECT: string = 'WE_SELECT';
	public static readonly WE_SELECTED: string = 'WE_SELECTED';
	public static readonly WE_UNSELECT: string = 'WE_UNSELECT';
	public static readonly WE_UNSELECTED: string = 'WE_UNSELECTED';
	public static readonly WE_LOCK: string = 'WE_LOCK';
	public static readonly WE_LOCKED: string = 'WE_LOCKED';
	public static readonly WE_UNLOCK: string = 'WE_UNLOCK';
	public static readonly WE_UNLOCKED: string = 'WE_UNLOCKED';
	public static readonly WE_ENABLE: string = 'WE_ENABLE';
	public static readonly WE_ENABLED: string = 'WE_ENABLED';
	public static readonly WE_DISABLE: string = 'WE_DISABLE';
	public static readonly WE_DISABLED: string = 'WE_DISABLED';
	public static readonly WE_RELOCATE: string = 'WE_RELOCATE';
	public static readonly WE_RELOCATED: string = 'WE_RELOCATED';
	public static readonly WE_RESIZE: string = 'WE_RESIZE';
	public static readonly WE_RESIZED: string = 'WE_RESIZED';
	public static readonly WE_MINIMIZE: string = 'WE_MINIMIZE';
	public static readonly WE_MINIMIZED: string = 'WE_MINIMIZED';
	public static readonly WE_MAXIMIZE: string = 'WE_MAXIMIZE';
	public static readonly WE_MAXIMIZED: string = 'WE_MAXIMIZED';
	public static readonly WE_RESTORE: string = 'WE_RESTORE';
	public static readonly WE_RESTORED: string = 'WE_RESTORED';
	public static readonly WE_CHILD_ADDED: string = 'WE_CHILD_ADDED';
	public static readonly WE_CHILD_REMOVED: string = 'WE_CHILD_REMOVED';
	public static readonly WE_CHILD_RELOCATED: string = 'WE_CHILD_RELOCATED';
	public static readonly WE_CHILD_RESIZED: string = 'WE_CHILD_RESIZED';
	public static readonly WE_CHILD_ACTIVATED: string = 'WE_CHILD_ACTIVATED';
	public static readonly WE_CHILD_VISIBILITY: string = 'WE_CHILD_VISIBILITY';
	public static readonly WE_PARENT_ADDED: string = 'WE_PARENT_ADDED';
	public static readonly WE_PARENT_REMOVED: string = 'WE_PARENT_REMOVED';
	public static readonly WE_PARENT_RELOCATED: string = 'WE_PARENT_RELOCATED';
	public static readonly WE_PARENT_RESIZED: string = 'WE_PARENT_RESIZED';
	public static readonly WE_PARENT_ACTIVATED: string = 'WE_PARENT_ACTIVATED';
	public static readonly WE_OK: string = 'WE_OK';
	public static readonly WE_CANCEL: string = 'WE_CANCEL';
	public static readonly WE_CHANGE: string = 'WE_CHANGE';
	public static readonly WE_SCROLL: string = 'WE_SCROLL';
	public static readonly UNKNOWN: string = '';

	private static readonly _pool: WindowEvent[] = [];

	protected _prevented: boolean = false;
	protected _recycled: boolean = false;
	protected _poolRef: WindowEvent[] = WindowEvent._pool;

	protected _type: string = '';

	/** The event type identifier. */
	public get type(): string
	{
		return this._type;
	}

	protected _window: IWindow | null = null;

	/** The target window that dispatched this event. */
	public get window(): IWindow | null
	{
		return this._window;
	}

	protected _related: IWindow | null = null;

	/** The related window (parent, child, etc.). */
	public get related(): IWindow | null
	{
		return this._related;
	}

	protected _cancelable: boolean = false;

	/** Whether this event supports cancellation. */
	public get cancelable(): boolean
	{
		return this._cancelable;
	}

	/** The target window that dispatched this event. */
	public get target(): IWindow | null
	{
		return this._window;
	}

	/**
	 * Allocates a WindowEvent from the pool or creates a new one.
	 *
	 * @param type - The event type string
	 * @param window - The target window
	 * @param related - The related window (e.g. parent or child)
	 * @param cancelable - Whether the event can be cancelled
	 * @returns A pooled or new WindowEvent instance
	 */
	public static allocate(type: string, window: IWindow | null, related: IWindow | null, cancelable: boolean = false): WindowEvent
	{
		const event: WindowEvent = (WindowEvent._pool.length > 0)
			? WindowEvent._pool.pop()!
			: new WindowEvent();

		event._type = type;
		event._window = window;
		event._related = related;
		event._cancelable = cancelable;
		event._recycled = false;
		event._poolRef = WindowEvent._pool;

		return event;
	}

	/**
	 * Returns this event to its object pool for reuse.
	 *
	 * @throws Error if the event has already been recycled
	 */
	public recycle(): void
	{
		if (this._recycled)
		{
			throw new Error('Event already recycled!');
		}

		this._window = null;
		this._related = null;
		this._recycled = true;
		this._prevented = false;
		this._poolRef.push(this);
	}

	/**
	 * Creates a clone of this event via the pool.
	 *
	 * @returns A new WindowEvent with the same properties
	 */
	public clone(): WindowEvent
	{
		return WindowEvent.allocate(this._type, this._window, this._related, this._cancelable);
	}

	/**
	 * Prevents the default window operation.
	 * Alias for {@link preventWindowOperation}.
	 */
	public preventDefault(): void
	{
		this.preventWindowOperation();
	}

	/**
	 * Returns whether the default action has been prevented.
	 */
	public isDefaultPrevented(): boolean
	{
		return this._prevented;
	}

	/**
	 * Prevents the associated window operation if the event is cancelable.
	 *
	 * @throws Error if the event is not cancelable
	 */
	public preventWindowOperation(): void
	{
		if (this._cancelable)
		{
			this._prevented = true;
		}
		else
		{
			throw new Error('Attempted to prevent window operation that is not cancelable!');
		}
	}

	/**
	 * Returns whether the window operation has been prevented.
	 */
	public isWindowOperationPrevented(): boolean
	{
		return this._prevented;
	}

	/**
	 * Stops propagation of this event.
	 */
	public stopPropagation(): void
	{
		this._prevented = true;
	}

	/**
	 * Stops immediate propagation of this event.
	 */
	public stopImmediatePropagation(): void
	{
		this._prevented = true;
	}

	/**
	 * Returns a string representation of this event.
	 */
	public toString(): string
	{
		return `WindowEvent { type: ${this._type} cancelable: ${this._cancelable} window: ${this._window} }`;
	}
}

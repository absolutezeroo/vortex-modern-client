import type {WindowEvent} from './WindowEvent';

/**
 * Listener entry with callback and priority for ordered dispatch.
 */
interface EventListenerEntry
{
	listener: Function;
	priority: number;
}

/**
 * Event dispatcher for window events with priority-based listener ordering.
 *
 * Manages event listeners per event type and dispatches {@link WindowEvent}
 * instances to registered callbacks in priority order (highest first).
 *
 * @see sources/win63_2021_version/com/sulake/core/window/events/WindowEventDispatcher.as
 */
export class WindowEventDispatcher
{
	// ── Instance fields ──────────────────────────────────────────────

	private _listeners: Map<string, EventListenerEntry[]> = new Map();
	private _disposed: boolean = false;

	// ── Accessors ────────────────────────────────────────────────────

	/** Whether this dispatcher has been disposed. */
	public get disposed(): boolean
	{
		return this._disposed;
	}

	// ── Methods ──────────────────────────────────────────────────────

	/**
	 * Registers an event listener for the given event type.
	 *
	 * If the same callback is already registered for this type it is not
	 * added again. Listeners are inserted in descending priority order
	 * so higher-priority listeners fire first.
	 *
	 * @param type - The event type string
	 * @param listener - The callback function
	 * @param priority - Listener priority (higher fires first, default 0)
	 */
	public addEventListener(type: string, listener: Function, priority: number = 0): void
	{
		let entries = this._listeners.get(type);
		const entry: EventListenerEntry = {listener, priority};

		if (!entries)
		{
			entries = [entry];
			this._listeners.set(type, entries);
		}
		else
		{
			for (const existing of entries)
			{
				if (existing.listener === listener)
				{
					return;
				}
			}

			let inserted = false;

			for (let i = 0; i < entries.length; i++)
			{
				if (priority > entries[i].priority)
				{
					entries.splice(i, 0, entry);
					inserted = true;
					break;
				}
			}

			if (!inserted)
			{
				entries.push(entry);
			}
		}
	}

	/**
	 * Removes a previously registered event listener.
	 *
	 * @param type - The event type string
	 * @param listener - The callback function to remove
	 */
	public removeEventListener(type: string, listener: Function): void
	{
		if (this._disposed) return;

		const entries = this._listeners.get(type);

		if (entries)
		{
			for (let i = 0; i < entries.length; i++)
			{
				if (entries[i].listener === listener)
				{
					entries.splice(i, 1);

					if (entries.length === 0)
					{
						this._listeners.delete(type);
					}

					return;
				}
			}
		}
	}

	/**
	 * Dispatches a window event to all registered listeners of its type.
	 *
	 * Listeners are invoked in priority order. Returns `true` if the
	 * event was not prevented, `false` otherwise.
	 *
	 * @param event - The window event to dispatch
	 * @returns `true` if the event was not prevented
	 */
	public dispatchEvent(event: WindowEvent): boolean
	{
		if (this._disposed) return false;

		const entries = this._listeners.get(event.type);

		if (entries)
		{
			const callbacks: Function[] = [];

			for (const entry of entries)
			{
				callbacks.push(entry.listener);
			}

			for (const callback of callbacks)
			{
				callback(event);
			}
		}

		return !event.isDefaultPrevented();
	}

	/**
	 * Returns whether any listener is registered for the given event type.
	 *
	 * @param type - The event type string
	 * @returns `true` if at least one listener exists
	 */
	public hasEventListener(type: string): boolean
	{
		if (this._disposed) return false;

		return this._listeners.has(type);
	}

	/**
	 * Disposes this dispatcher, clearing all listener references.
	 */
	public dispose(): void
	{
		if (this._disposed) return;

		for (const [, entries] of this._listeners)
		{
			for (const entry of entries)
			{
				(entry as { listener: Function | null }).listener = null;
			}
		}

		this._listeners.clear();
		this._disposed = true;
	}
}

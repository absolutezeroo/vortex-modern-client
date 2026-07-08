/**
 * Queue of pending mouse events for batch processing.
 *
 * In AS3 this extended GenericEventQueue and listened to Flash stage
 * mouse events, buffering them for later processing by the
 * MouseEventProcessor. In TypeScript, DOM events are collected and
 * queued here for engine-side consumption.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/utils/MouseEventQueue.as
 */
export interface IMouseEventEntry
{
    type: string;
    stageX: number;
    stageY: number;
    altKey: boolean;
    ctrlKey: boolean;
    shiftKey: boolean;
    buttonDown: boolean;
    delta: number;
}

export class MouseEventQueue
{
    private _events: IMouseEventEntry[] = [];
    private _readIndex: number = 0;

    private _mouseX: number = 0;

    /**
	 * The current mouse position.
	 */
    public get mouseX(): number
    {
        return this._mouseX;
    }

    private _mouseY: number = 0;

    public get mouseY(): number
    {
        return this._mouseY;
    }

    private _disposed: boolean = false;

    public get disposed(): boolean
    {
        return this._disposed;
    }

    /**
	 * Number of events currently in the queue.
	 */
    public get length(): number
    {
        return this._events.length;
    }

    /**
	 * Enqueues a mouse event.
	 *
	 * @param event - The mouse event entry to enqueue
	 */
    public enqueue(event: IMouseEventEntry): void
    {
        this._mouseX = event.stageX;
        this._mouseY = event.stageY;
        this._events.push(event);
    }

    /**
	 * Begins sequential reading of the queue.
	 */
    public begin(): void
    {
        this._readIndex = 0;
    }

    /**
	 * Returns the next event in the queue, or null if exhausted.
	 *
	 * @returns The next event entry, or null
	 */
    public next(): IMouseEventEntry | null
    {
        if(this._readIndex < this._events.length)
        {
            return this._events[this._readIndex++];
        }

        return null;
    }

    /**
	 * Removes the most recently read event from the queue.
	 */
    public remove(): void
    {
        if(this._readIndex > 0)
        {
            this._events.splice(this._readIndex - 1, 1);
            this._readIndex--;
        }
    }

    /**
	 * Ends sequential reading of the queue.
	 */
    public end(): void
    {
        this._readIndex = 0;
    }

    /**
	 * Dequeues and returns the oldest event in the queue.
	 *
	 * @returns The oldest event, or null if empty
	 */
    public dequeue(): IMouseEventEntry | null
    {
        if(this._events.length === 0)
        {
            return null;
        }

        return this._events.shift()!;
    }

    /**
	 * Removes all events from the queue.
	 */
    public flush(): void
    {
        this._events.length = 0;
        this._readIndex = 0;
    }

    public dispose(): void
    {
        if(!this._disposed)
        {
            this._disposed = true;
            this._events.length = 0;
        }
    }
}

import type {IMouseListenerService} from './IMouseListenerService';
import type {IWindow} from '../IWindow';
import {WindowMouseOperator} from './WindowMouseOperator';

/**
 * Mouse listener service.
 *
 * Extends WindowMouseOperator to filter mouse events by type and
 * area limit. Windows can subscribe to specific event types and
 * restrict events to inside or outside their bounds.
 *
 * Area limit values:
 * - 0: All events (no filtering)
 * - 1: Inside only (events must hit-test inside the window)
 * - 3: Outside only (events must hit-test outside the window)
 *
 * @see sources/win63_version/core/window/services/WindowMouseListener.as
 */
export class WindowMouseListener extends WindowMouseOperator implements IMouseListenerService
{
	private _eventTypes: string[] = [];

	get eventTypes(): string[]
	{
		return this._eventTypes;
	}

	private _areaLimit: number = 0;

	get areaLimit(): number
	{
		return this._areaLimit;
	}

	set areaLimit(value: number)
	{
		this._areaLimit = value;
	}

	/**
	 * End the mouse listener operation.
	 * Clears all subscribed event types.
	 *
	 * @param window - The window to stop listening on
	 * @returns The previously tracked window
	 */
	public override end(window: IWindow): IWindow | null
	{
		while (this._eventTypes.length > 0)
		{
			this._eventTypes.pop();
		}

		return super.end(window);
	}

	/**
	 * Check if a mouse event passes the area limit filter.
	 *
	 * @param stageX - Stage X coordinate of the event
	 * @param stageY - Stage Y coordinate of the event
	 * @returns true if the event should be processed
	 */
	public passesAreaFilter(stageX: number, stageY: number): boolean
	{
		if (!this._active || !this._window || this._window.disposed) return false;

		if (this._areaLimit === 0) return true;

		const isInside = this._window.hitTestGlobalPoint({x: stageX, y: stageY});

		// Area limit = 1: inside only
		if (this._areaLimit === 1 && !isInside) return false;

		// Area limit = 3: outside only
		if (this._areaLimit === 3 && isInside) return false;

		return true;
	}

	/**
	 * No-op: the listener does not move anything.
	 */
	public override operate(_x: number, _y: number): void
	{
		// No-op — WindowMouseListener does not move or resize
	}
}

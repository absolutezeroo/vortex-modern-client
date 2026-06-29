/**
 * IRoomWidgetHandler
 *
 * @see sources/source_as_win63/habbo/ui/IRoomWidgetHandler.as
 *
 * Interface for room widget handlers that process messages and events.
 */
import type {IDisposable} from '@core/runtime/IDisposable';
import type {IRoomWidgetHandlerContainer} from './IRoomWidgetHandlerContainer';

export interface IRoomWidgetHandler extends IDisposable
{
	/**
	 * The handler type identifier.
	 */
	readonly type: string;

	/**
	 * Sets the container providing services to this handler.
	 */
	set container(value: IRoomWidgetHandlerContainer);

	/**
	 * Gets the list of widget message types this handler processes.
	 */
	getWidgetMessages(): string[];

	/**
	 * Processes a widget message.
	 */
	processWidgetMessage(message: unknown): unknown;

	/**
	 * Gets the list of event types this handler processes.
	 */
	getProcessedEvents(): string[];

	/**
	 * Processes an event.
	 */
	processEvent(event: unknown): void;

	/**
	 * Called each frame to update handler state.
	 */
	update(): void;
}

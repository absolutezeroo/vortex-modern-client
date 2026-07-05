/**
 * IRoomDesktop
 *
 * @see sources/source_as_win63/habbo/ui/IRoomDesktop.as
 *
 * Interface for a per-room desktop instance.
 */
import type {EventEmitter} from 'eventemitter3';
import type {IRoomSession} from '@habbo/session/IRoomSession';

export interface IRoomDesktop
{
	/**
	 * Event emitter for desktop events.
	 *
	 * NOTE: Named `desktopEvents` to avoid overriding Component's `events`.
	 */
	readonly desktopEvents: EventEmitter;

	/**
	 * The active room session.
	 */
	readonly roomSession: IRoomSession;

	/**
	 * Gets the first canvas ID for this desktop.
	 */
	getFirstCanvasId(): number;

	/**
	 * Gets the room view rectangle.
	 */
	getRoomViewRect(): { x: number; y: number; width: number; height: number } | null;

	/**
	 * Processes an event.
	 */
	processEvent(event: unknown): void;

	// AS3: sources/win63_version/habbo/ui/IRoomDesktop.as::getWidget()
	getWidget(type: string): unknown | null;
}

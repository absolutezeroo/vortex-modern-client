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
    set container(value: IRoomWidgetHandlerContainer | null);

    /**
	 * Gets the list of widget message types this handler processes.
	 *
	 * `null` is admitted for the same reason as `getProcessedEvents()` below: AS3 returns a null
	 * `Array` from handlers whose widget never sends them a message (`_SafeCls_3971`, the
	 * rentable-space handler, talks to its widget through direct method calls instead), and `[]`
	 * from the rest. RoomDesktop iterates the result, so both mean "no messages".
	 */
    getWidgetMessages(): string[] | null;

    /**
	 * Processes a widget message.
	 */
    processWidgetMessage(message: unknown): unknown;

    /**
	 * Gets the list of event types this handler processes.
	 *
	 * `null` is distinct from an empty array and AS3 uses both: `CustomUserNotificationWidgetHandler`
	 * returns null (its `Array` is never allocated) while others return `[]`. RoomDesktop iterates
	 * the result, so both mean "subscribe to nothing" — but the signature has to admit null or a
	 * faithful handler cannot be written.
	 */
    getProcessedEvents(): string[] | null;

    /**
	 * Processes an event.
	 */
    processEvent(event: unknown): void;

    /**
	 * Called each frame to update handler state.
	 */
    update(): void;
}

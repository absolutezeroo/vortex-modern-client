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
    // AS3: .../src/com/sulake/habbo/ui/IRoomDesktop.as::get roomSession()
    readonly roomSession: IRoomSession;

    /**
	 * Gets the first canvas ID for this desktop.
	 */
    // AS3: .../src/com/sulake/habbo/ui/IRoomDesktop.as::getFirstCanvasId()
    getFirstCanvasId(): number;

    /**
	 * Gets the room view rectangle.
	 */
    // AS3: .../src/com/sulake/habbo/ui/IRoomDesktop.as::getRoomViewRect()
    getRoomViewRect(): { x: number; y: number; width: number; height: number } | null;

    /**
	 * Processes an event.
	 */
    // AS3: .../src/com/sulake/habbo/ui/IRoomDesktop.as::processEvent()
    processEvent(event: unknown): void;

    /**
	 * Routes a widget message to the handler registered for its type.
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/IRoomDesktop.as::processWidgetMessage()
    processWidgetMessage(message: unknown): unknown;

    // AS3: sources/win63_version/habbo/ui/IRoomDesktop.as::getWidget()
    getWidget(type: string): unknown | null;

    /**
	 * The room canvas's zoom scale, snapped to the nearest whole step.
	 */
    // AS3: .../src/com/sulake/habbo/ui/IRoomDesktop.as::getCurrentRoomCanvasZoomScale()
    getCurrentRoomCanvasZoomScale(): number;

    /**
	 * Whether a zoom step in that direction would change anything — false at either end of the
	 * scale table, which is what greys the toolbar's +/- buttons out.
	 */
    // AS3: .../src/com/sulake/habbo/ui/IRoomDesktop.as::canZoomRoomCanvas()
    canZoomRoomCanvas(direction: number): boolean;

    /**
	 * Steps the room canvas one entry up or down the scale table, animated.
	 */
    // AS3: .../src/com/sulake/habbo/ui/IRoomDesktop.as::zoomRoomCanvas()
    zoomRoomCanvas(direction: number): void;
}

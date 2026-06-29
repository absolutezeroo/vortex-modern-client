/**
 * IRoomUI
 *
 * @see sources/source_as_win63/habbo/ui/IRoomUI.as
 *
 * Public interface for the room UI component.
 */
import type {IRoomDesktop} from './IRoomDesktop';
import type {IRoomSession} from '@habbo/session/IRoomSession';

export interface IRoomUI
{
	/**
	 * Creates a desktop for the given room session.
	 */
	createDesktop(session: IRoomSession): IRoomDesktop;

	/**
	 * Disposes a desktop by room identifier.
	 */
	disposeDesktop(identifier: string): void;

	/**
	 * Gets a desktop by room identifier.
	 */
	getDesktop(identifier: string): IRoomDesktop | null;

	/**
	 * Gets the active canvas ID for a room.
	 */
	getActiveCanvasId(roomId: number): number;

	/**
	 * Sets visibility of the active desktop.
	 */
	set visible(value: boolean);

	/**
	 * Triggers bottom bar resize.
	 */
	triggerBottomBarResize(): void;
}

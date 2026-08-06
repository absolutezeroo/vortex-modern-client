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
    // AS3: .../src/com/sulake/habbo/ui/IRoomUI.as::createDesktop()
    createDesktop(session: IRoomSession): IRoomDesktop;

    /**
	 * Disposes a desktop by room identifier.
	 */
    // AS3: .../src/com/sulake/habbo/ui/IRoomUI.as::disposeDesktop()
    disposeDesktop(identifier: string): void;

    /**
	 * Gets a desktop by room identifier.
	 */
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/ui/IRoomUI.as::getDesktop()
    getDesktop(identifier: string): IRoomDesktop | null;

    /**
	 * The active room desktop.
	 *
	 * AS3: sources/source_as_win63/habbo/ui/IRoomUI.as::get desktop()
	 */
    // AS3: .../src/com/sulake/habbo/ui/IRoomUI.as::get desktop()
    get desktop(): IRoomDesktop | null;

    /**
	 * Gets the active canvas ID for a room.
	 */
    // AS3: .../src/com/sulake/habbo/ui/IRoomUI.as::getActiveCanvasId()
    getActiveCanvasId(roomId: number): number;

    /**
	 * Sets visibility of the active desktop.
	 */
    // AS3: .../src/com/sulake/habbo/ui/IRoomUI.as::set visible()
    set visible(value: boolean);

    /**
	 * Triggers bottom bar resize.
	 */
    // AS3: sources/win63_version/habbo/ui/IRoomUI.as::triggerbottomBarResize()
    triggerbottomBarResize(): void;

    /**
	 * TS alias kept for existing callers; delegates to the AS3-named API.
	 */
    triggerBottomBarResize(): void;
}

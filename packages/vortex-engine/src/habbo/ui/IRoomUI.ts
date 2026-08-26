/**
 * IRoomUI
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/IRoomUI.as
 *
 * Public interface for the room UI component.
 */
import type {IRoomDesktop} from './IRoomDesktop';
import type {IRoomSession} from '@habbo/session/IRoomSession';
import type {IDisplayObjectWrapper} from '@core/window/components/IDisplayObjectWrapper';

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
	 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/IRoomUI.as::get desktop()
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
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/IRoomUI.as::triggerbottomBarResize()
    triggerbottomBarResize(): void;

    /**
	 * TS alias kept for existing callers; delegates to the AS3-named API.
	 */
    triggerBottomBarResize(): void;

    /**
	 * Whether the point a mouse event happened at is covered by a context menu or dialog, in which
	 * case a room-canvas click must propagate to it instead of selecting an avatar.
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/RoomUI.as::mouseEventPositionHasContextMenu()
    mouseEventPositionHasContextMenu(event: { global: { x: number; y: number } }): boolean;

    /**
	 * The window container the free-flow chat display object is mounted into.
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/IRoomUI.as::get chatContainer()
    get chatContainer(): IDisplayObjectWrapper | null;

    /**
	 * Routes a HideRoomWidgetEvent to the current desktop's widget handlers.
	 */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/IRoomUI.as::hideWidget()
    hideWidget(widgetType: string): void;

    // TODO(AS3): sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/IRoomUI.as::showGamePlayerName()
    // Forwards to RoomDesktop.showGamePlayerName() -> AvatarInfoWidget.showGamePlayerName(), which
    // needs `UserNameView` (the avatar name bubble view). AvatarInfoWidget.ts's own header already
    // documents UserNameView as unported; RoomDesktop.ts's TODO at its own showGamePlayerName()
    // mislabels the blocker as the game/ad manager — the AS3 body reads only the RWE_AVATAR_INFO
    // widget and never touches either.
}

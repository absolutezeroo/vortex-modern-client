/**
 * IRoomWidgetHandlerContainer
 *
 * @see sources/source_as_win63/habbo/ui/IRoomWidgetHandlerContainer.as
 *
 * Exposes services to widget handlers. Implemented by RoomDesktop.
 */
import type {EventEmitter} from 'eventemitter3';
import type {IConnection} from '@core/communication/connection/IConnection';
import type {IRoomEngine} from '@habbo/room/IRoomEngine';
import type {IRoomSession} from '@habbo/session/IRoomSession';
import type {IRoomSessionManager} from '@habbo/session/IRoomSessionManager';
import type {ISessionDataManager} from '@habbo/session/ISessionDataManager';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IHabboToolbar} from '@habbo/toolbar/IHabboToolbar';
import type {IRoomWidgetFactory} from './IRoomWidgetFactory';
import type {IRoomWidgetHandler} from './IRoomWidgetHandler';
import type {RoomDesktopLayoutManager} from './RoomDesktopLayoutManager';

export interface IRoomWidgetHandlerContainer
{
	readonly roomSession: IRoomSession;
	readonly sessionDataManager: ISessionDataManager | null;
	readonly desktopEvents: EventEmitter;
	readonly roomEngine: IRoomEngine | null;
	readonly roomSessionManager: IRoomSessionManager | null;
	readonly roomWidgetFactory: IRoomWidgetFactory | null;
	readonly localization: IHabboLocalizationManager | null;
	// AS3: sources/win63_version/habbo/ui/IRoomWidgetHandlerContainer.as::get toolbar()
	readonly toolbar: IHabboToolbar | null;
	readonly windowManager: IHabboWindowManager | null;
	readonly connection: IConnection | null;
	readonly layoutManager: RoomDesktopLayoutManager;

	setRoomViewColor(color: number, brightness: number): void;
	setRoomBackgroundColor(h: number, s: number, l: number): void;
	getFirstCanvasId(): number;
	getRoomViewRect(): { x: number; y: number; width: number; height: number } | null;
	processWidgetMessage(message: unknown): unknown;
	addUpdateListener(handler: IRoomWidgetHandler): void;
	removeUpdateListener(handler: IRoomWidgetHandler): void;
}

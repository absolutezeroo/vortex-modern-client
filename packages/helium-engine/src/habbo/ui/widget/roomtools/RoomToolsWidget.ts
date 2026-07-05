/**
 * RoomToolsWidget
 *
 * @see sources/win63_version/habbo/ui/widget/roomtools/RoomToolsWidget.as
 *
 * Container for the RWE_ROOM_TOOLS widget: owns the toolbar icon strip and
 * the room-info popup, tracks visited-room history for back/forward
 * navigation, and forwards collapse/release/reuse lifecycle calls.
 */
import type {IWindow} from '@core/window/IWindow';
import {RoomWidgetBase} from '@habbo/ui/widget/RoomWidgetBase';
import type {IRoomWidgetHandler} from '@habbo/ui/IRoomWidgetHandler';
import type {IRoomDesktop} from '@habbo/ui/IRoomDesktop';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {RoomUI} from '@habbo/ui/RoomUI';
import type {GuestRoomData} from '@habbo/communication/messages/incoming/navigator/GuestRoomData';
import {StringUtil} from '@habbo/utils/StringUtil';
import type {RoomToolsWidgetHandler} from '@habbo/ui/handler/RoomToolsWidgetHandler';
import {RoomToolsInfoCtrl} from './RoomToolsInfoCtrl';
import {RoomToolsToolbarCtrl} from './RoomToolsToolbarCtrl';

const ROOM_HISTORY_MAX_LENGTH = 10;

export class RoomToolsWidget extends RoomWidgetBase
{
	private static _currentRoomIndex: number = 0;
	private static _visitedRooms: GuestRoomData[] = [];

	private _currentRoomName: string = '';
	private _toolbarCtrl: RoomToolsToolbarCtrl | null;
	private _infoCtrl: RoomToolsInfoCtrl | null;
	private _desktop: IRoomDesktop | null;
	private _roomToolsTimer: ReturnType<typeof setTimeout> | null = null;

	// AS3: sources/win63_version/habbo/ui/widget/roomtools/RoomToolsWidget.as::RoomToolsWidget()
	constructor(handler: IRoomWidgetHandler, windowManager: IHabboWindowManager, assets: IAssetLibrary | null, roomUI: RoomUI)
	{
		super(handler, windowManager, assets, roomUI.localization);

		this.handler.widget = this;
		this._desktop = roomUI.desktop;

		this._infoCtrl = new RoomToolsInfoCtrl(this, windowManager, assets);
		this._toolbarCtrl = new RoomToolsToolbarCtrl(this, windowManager, assets);
		this._toolbarCtrl.updateRoomHistoryButtons();
		// TODO(AS3): freeFlowChat isn't wired into RoomUI yet — default to visible,
		// matching AS3's `!var_1560 || !var_1560.isDisabledInPreferences` when null.
		this._toolbarCtrl.setChatHistoryButton(true);

		const cameraLaunchPosition = roomUI.getProperty('camera.launch.ui.position');

		this._toolbarCtrl.setCameraButton(
			(this.handler.sessionDataManager?.isPerkAllowed('CAMERA') ?? false)
			&& (StringUtil.isBlank(cameraLaunchPosition) || cameraLaunchPosition === 'room-menu')
		);
		this._toolbarCtrl.setLikeButton(this.handler.canRate);
		this._toolbarCtrl.setCollapsed(
			(this.handler.sessionDataManager?.isNoob ?? true)
			|| !((this.handler.sessionDataManager?.uiFlags ?? 0) & 2)
		);
	}

	// AS3: sources/win63_version/habbo/ui/widget/roomtools/RoomToolsWidget.as::dispose()
	public override dispose(): void
	{
		if(this._roomToolsTimer !== null)
		{
			clearTimeout(this._roomToolsTimer);
			this._roomToolsTimer = null;
		}

		this._toolbarCtrl?.dispose();
		this._toolbarCtrl = null;

		this._infoCtrl?.dispose();
		this._infoCtrl = null;

		this._desktop = null;

		super.dispose();
	}

	// AS3: sources/win63_version/habbo/ui/widget/roomtools/RoomToolsWidget.as::updateRoomData()
	public updateRoomData(data: GuestRoomData): void
	{
		for(const room of RoomToolsWidget._visitedRooms)
		{
			if(room.flatId === data.flatId)
			{
				room.roomName = data.roomName;
			}
		}
	}

	// AS3: sources/win63_version/habbo/ui/widget/roomtools/RoomToolsWidget.as::storeRoomData()
	public storeRoomData(data: GuestRoomData): void
	{
		for(const room of RoomToolsWidget._visitedRooms)
		{
			if(room.flatId === data.flatId) return;
		}

		RoomToolsWidget._visitedRooms.push(data);

		if(RoomToolsWidget._visitedRooms.length > ROOM_HISTORY_MAX_LENGTH)
		{
			RoomToolsWidget._visitedRooms.shift();
		}

		RoomToolsWidget._currentRoomIndex = RoomToolsWidget._visitedRooms.length - 1;
		this._toolbarCtrl?.setLikeButton(this.handler.canRate);
	}

	// AS3: sources/win63_version/habbo/ui/widget/roomtools/RoomToolsWidget.as::showRoomInfo()
	public showRoomInfo(isOwner: boolean, roomName: string, ownerLine: string, tags: string[] | null): void
	{
		if(!this._infoCtrl) return;

		this._currentRoomName = roomName;
		this._infoCtrl.showRoomInfo(isOwner, roomName, ownerLine, tags);
	}

	// AS3: sources/win63_version/habbo/ui/widget/roomtools/RoomToolsWidget.as::enterNewRoom()
	public enterNewRoom(flatId: number): void
	{
		if(!this._toolbarCtrl || !this._infoCtrl) return;

		RoomToolsWidget._visitedRooms.forEach((room, index) =>
		{
			if(room.flatId === flatId)
			{
				RoomToolsWidget._currentRoomIndex = index;
			}
		});

		this._toolbarCtrl.disableRoomHistoryButtons();

		if(this._roomToolsTimer !== null)
		{
			clearTimeout(this._roomToolsTimer);
		}

		this._roomToolsTimer = setTimeout(() => this.roomButtonTimerEventHandler(), 2000);

		const tagsBorder = this._infoCtrl.window?.findChildByName('tags');

		if(tagsBorder) tagsBorder.visible = true;
	}

	// AS3: sources/win63_version/habbo/ui/widget/roomtools/RoomToolsWidget.as::roomButtonTimerEventHandler()
	private roomButtonTimerEventHandler(): void
	{
		if(this._roomToolsTimer !== null)
		{
			clearTimeout(this._roomToolsTimer);
			this._roomToolsTimer = null;
		}

		this._toolbarCtrl?.updateRoomHistoryButtons();
	}

	// AS3: sources/win63_version/habbo/ui/widget/roomtools/RoomToolsWidget.as::setCollapsed()
	public setCollapsed(value: boolean): void
	{
		this._toolbarCtrl?.setCollapsed(value);
		this._infoCtrl?.setToolbarCollapsed(value);
	}

	// AS3: sources/win63_version/habbo/ui/widget/roomtools/RoomToolsWidget.as::get handler()
	public get handler(): RoomToolsWidgetHandler
	{
		return this._handler as RoomToolsWidgetHandler;
	}

	// AS3: sources/win63_version/habbo/ui/widget/roomtools/RoomToolsWidget.as::getIconLocation()
	public getIconLocation(name: string): IWindow | null
	{
		return this._toolbarCtrl?.window?.findChildByName(name) ?? null;
	}

	// AS3: sources/win63_version/habbo/ui/widget/roomtools/RoomToolsWidget.as::getWidgetAreaWidth()
	public getWidgetAreaWidth(): number
	{
		return this._toolbarCtrl?.right ?? 0;
	}

	// AS3: sources/win63_version/habbo/ui/widget/roomtools/RoomToolsWidget.as::getChatInputY()
	public getChatInputY(): number
	{
		if(!this._desktop) return 0;

		const chatInputWidget = this._desktop.getWidget('RWE_CHAT_INPUT_WIDGET') as {getChatInputY?: () => number} | null;

		return chatInputWidget?.getChatInputY?.() ?? 0;
	}

	// AS3: sources/win63_version/habbo/ui/widget/roomtools/RoomToolsWidget.as::getRoomToolbarRight()
	public getRoomToolbarRight(): number
	{
		return this._toolbarCtrl?.right ?? 0;
	}

	// AS3: sources/win63_version/habbo/ui/widget/roomtools/RoomToolsWidget.as::goToNextRoom()
	public goToNextRoom(): void
	{
		const nextIndex = Math.min(RoomToolsWidget._currentRoomIndex + 1, RoomToolsWidget._visitedRooms.length);
		const room = RoomToolsWidget._visitedRooms[nextIndex];

		if(room) this.handler.goToPrivateRoom(room.flatId);

		this._toolbarCtrl?.disableRoomHistoryButtons();
	}

	// AS3: sources/win63_version/habbo/ui/widget/roomtools/RoomToolsWidget.as::goToPreviousRoom()
	public goToPreviousRoom(): void
	{
		const prevIndex = Math.max(RoomToolsWidget._currentRoomIndex - 1, 0);
		const room = RoomToolsWidget._visitedRooms[prevIndex];

		if(room) this.handler.goToPrivateRoom(room.flatId);

		this._toolbarCtrl?.disableRoomHistoryButtons();
	}

	// AS3: sources/win63_version/habbo/ui/widget/roomtools/RoomToolsWidget.as::get visitedRooms()
	public get visitedRooms(): GuestRoomData[]
	{
		return RoomToolsWidget._visitedRooms;
	}

	// AS3: sources/win63_version/habbo/ui/widget/roomtools/RoomToolsWidget.as::get currentRoomIndex()
	public get currentRoomIndex(): number
	{
		return RoomToolsWidget._currentRoomIndex;
	}

	// AS3: sources/win63_version/habbo/ui/widget/roomtools/RoomToolsWidget.as::get currentRoomName()
	public get currentRoomName(): string
	{
		return this._currentRoomName;
	}

	// AS3: sources/win63_version/habbo/ui/widget/roomtools/RoomToolsWidget.as::get mainWindow()
	public override get mainWindow(): IWindow | null
	{
		return this._toolbarCtrl?.window ?? null;
	}

	// AS3: sources/win63_version/habbo/ui/widget/roomtools/RoomToolsWidget.as::release()
	public override release(): void
	{
		this._toolbarCtrl?.release();

		if(this._toolbarCtrl?.window) this._toolbarCtrl.window.visible = false;

		this._infoCtrl?.hide();

		super.release();
	}

	// AS3: sources/win63_version/habbo/ui/widget/roomtools/RoomToolsWidget.as::reuse()
	public override reuse(desktop: IRoomDesktop): void
	{
		super.reuse(desktop);

		this._desktop = desktop;

		if(this._toolbarCtrl?.window) this._toolbarCtrl.window.visible = true;
	}
}

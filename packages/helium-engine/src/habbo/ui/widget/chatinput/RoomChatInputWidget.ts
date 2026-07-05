/**
 * RoomChatInputWidget
 *
 * @see sources/win63_version/habbo/ui/widget/chatinput/RoomChatInputWidget.as
 *
 * TODO(AS3): see RoomChatInputView.ts header for scope cuts (chat styles, NUX
 * reminder, dimmer effect, help tooltip).
 */
import type {EventEmitter} from 'eventemitter3';
import type {IWindow} from '@core/window/IWindow';
import {RoomWidgetBase} from '@habbo/ui/widget/RoomWidgetBase';
import type {IRoomWidgetHandler} from '@habbo/ui/IRoomWidgetHandler';
import type {IRoomDesktop} from '@habbo/ui/IRoomDesktop';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {RoomUI} from '@habbo/ui/RoomUI';
import {RoomWidgetChatMessage} from '@habbo/ui/widget/messages/RoomWidgetChatMessage';
import {RoomWidgetRoomObjectUpdateEvent} from '@habbo/ui/widget/events/RoomWidgetRoomObjectUpdateEvent';
import {RoomWidgetChatInputContentUpdateEvent} from '@habbo/ui/widget/events/RoomWidgetChatInputContentUpdateEvent';
import {RoomWidgetUserInfoUpdateEvent} from '@habbo/ui/widget/events/RoomWidgetUserInfoUpdateEvent';
import {RoomWidgetFloodControlEvent} from '@habbo/ui/widget/events/RoomWidgetFloodControlEvent';
import type {ChatInputWidgetHandler} from '@habbo/ui/handler/ChatInputWidgetHandler';
import type {RoomToolsWidget} from '@habbo/ui/widget/roomtools/RoomToolsWidget';
import {RoomChatInputView} from './RoomChatInputView';

export class RoomChatInputWidget extends RoomWidgetBase
{
	private _view: RoomChatInputView | null;
	private _selectedUserName: string = '';
	private _floodBlocked: boolean = false;
	private _floodTimer: ReturnType<typeof setTimeout> | null = null;
	private _lastPasteTime: number = 0;
	private _roomUi: RoomUI | null;
	private _desktop: IRoomDesktop | null;

	// AS3: sources/win63_version/habbo/ui/widget/chatinput/RoomChatInputWidget.as::RoomChatInputWidget()
	constructor(
		handler: IRoomWidgetHandler, windowManager: IHabboWindowManager, assets: IAssetLibrary | null,
		localizations: IHabboLocalizationManager | null, roomUi: RoomUI, desktop: IRoomDesktop | null
	)
	{
		super(handler, windowManager, assets, localizations);

		this._roomUi = roomUi;
		this._desktop = desktop;
		this._view = new RoomChatInputView(this);
		this.handler.widget = this;
	}

	public get floodBlocked(): boolean
	{
		return this._floodBlocked;
	}

	public get roomUi(): RoomUI | null
	{
		return this._roomUi;
	}

	// AS3: sources/win63_version/habbo/ui/widget/chatinput/RoomChatInputWidget.as::get handler()
	public get handler(): ChatInputWidgetHandler
	{
		return this._handler as ChatInputWidgetHandler;
	}

	// AS3: sources/win63_version/habbo/ui/widget/chatinput/RoomChatInputWidget.as::dispose()
	public override dispose(): void
	{
		this._view?.dispose();
		this._view = null;

		if(this._floodTimer !== null)
		{
			clearTimeout(this._floodTimer);
			this._floodTimer = null;
		}

		this._roomUi = null;

		super.dispose();
	}

	public get allowPaste(): boolean
	{
		return performance.now() - this._lastPasteTime > 0;
	}

	public setLastPasteTime(): void
	{
		this._lastPasteTime = performance.now();
	}

	// AS3: sources/win63_version/habbo/ui/widget/chatinput/RoomChatInputWidget.as::sendChat()
	public sendChat(text: string, chatType: number, recipientName: string = '', styleId: number = 0): void
	{
		if(this._floodBlocked) return;

		const message = new RoomWidgetChatMessage('RWCM_MESSAGE_CHAT', text, chatType, recipientName, styleId);

		this.messageListener?.processWidgetMessage(message);
	}

	// AS3: sources/win63_version/habbo/ui/widget/chatinput/RoomChatInputWidget.as::registerUpdateEvents()
	public override registerUpdateEvents(dispatcher: EventEmitter): void
	{
		if(!dispatcher) return;

		dispatcher.on(RoomWidgetRoomObjectUpdateEvent.OBJECT_DESELECTED, this.onRoomObjectDeselected);
		dispatcher.on(RoomWidgetChatInputContentUpdateEvent.CHAT_INPUT_CONTENT, this.onChatInputUpdate);
		dispatcher.on(RoomWidgetUserInfoUpdateEvent.PEER, this.onUserInfo);
		dispatcher.on(RoomWidgetFloodControlEvent.FLOOD_CONTROL, this.onFloodControl);

		super.registerUpdateEvents(dispatcher);
	}

	// AS3: sources/win63_version/habbo/ui/widget/chatinput/RoomChatInputWidget.as::unregisterUpdateEvents()
	public override unregisterUpdateEvents(dispatcher: EventEmitter): void
	{
		if(!dispatcher) return;

		dispatcher.off(RoomWidgetRoomObjectUpdateEvent.OBJECT_DESELECTED, this.onRoomObjectDeselected);
		dispatcher.off(RoomWidgetChatInputContentUpdateEvent.CHAT_INPUT_CONTENT, this.onChatInputUpdate);
		dispatcher.off(RoomWidgetUserInfoUpdateEvent.PEER, this.onUserInfo);
		dispatcher.off(RoomWidgetFloodControlEvent.FLOOD_CONTROL, this.onFloodControl);
	}

	private onRoomObjectDeselected = (): void =>
	{
		this._selectedUserName = '';
	};

	private onUserInfo = (event: RoomWidgetUserInfoUpdateEvent): void =>
	{
		this._selectedUserName = event.name;
	};

	private onChatInputUpdate = (event: RoomWidgetChatInputContentUpdateEvent): void =>
	{
		if(event.messageType === RoomWidgetChatInputContentUpdateEvent.MESSAGE_TYPE_WHISPER)
		{
			const prefix = this.localizations?.getLocalization('widgets.chatinput.mode.whisper', ':tell') ?? ':tell';

			this._view?.displaySpecialChatMessage(prefix, event.userName);
		}
	};

	// AS3: sources/win63_version/habbo/ui/widget/chatinput/RoomChatInputWidget.as::checkChatInputPosition()
	public checkChatInputPosition(): void
	{
		this._view?.updatePosition();
	}

	// AS3: sources/win63_version/habbo/ui/widget/chatinput/RoomChatInputWidget.as::getFriendBarWidth()
	public getFriendBarWidth(): number
	{
		// TODO(AS3): friendBarView isn't wired into RoomUI yet — see HabboFriendBar.ts.
		return 0;
	}

	// AS3: sources/win63_version/habbo/ui/widget/chatinput/RoomChatInputWidget.as::getToolBarWidth()
	public getToolBarWidth(): number
	{
		return this.handler.container?.toolbar?.toolBarAreaWidth ?? 1000;
	}

	// AS3: sources/win63_version/habbo/ui/widget/chatinput/RoomChatInputWidget.as::getRoomToolsWidth()
	public getRoomToolsWidth(): number
	{
		const roomToolsWidget = this._desktop?.getWidget('RWE_ROOM_TOOLS') as RoomToolsWidget | null;

		return roomToolsWidget?.getWidgetAreaWidth() ?? 0;
	}

	public get selectedUserName(): string
	{
		return this._selectedUserName;
	}

	// AS3: sources/win63_version/habbo/ui/widget/chatinput/RoomChatInputWidget.as::onFloodControl()
	private onFloodControl = (event: RoomWidgetFloodControlEvent): void =>
	{
		this._floodBlocked = true;

		if(this._floodTimer !== null)
		{
			clearTimeout(this._floodTimer);
		}

		let remaining = event.seconds;

		this._view?.updateBlockText(remaining);
		this._view?.showFloodBlocking();

		const tick = (): void =>
		{
			remaining -= 1;

			if(remaining <= 0)
			{
				this._floodBlocked = false;
				this._view?.hideFloodBlocking();
				this._floodTimer = null;

				return;
			}

			this._view?.updateBlockText(remaining);
			this._floodTimer = setTimeout(tick, 1000);
		};

		this._floodTimer = setTimeout(tick, 1000);
	};

	// AS3: sources/win63_version/habbo/ui/widget/chatinput/RoomChatInputWidget.as::get mainWindow()
	public override get mainWindow(): IWindow | null
	{
		return this._view?.window ?? null;
	}

	// AS3: sources/win63_version/habbo/ui/widget/chatinput/RoomChatInputWidget.as::hide()
	public hide(): void
	{
		if(this.mainWindow) this.mainWindow.visible = false;
	}

	private show(): void
	{
		if(this.mainWindow) this.mainWindow.visible = true;
	}

	// AS3: sources/win63_version/habbo/ui/widget/chatinput/RoomChatInputWidget.as::getChatInputY()
	public getChatInputY(): number
	{
		return this._view?.getChatInputY() ?? 0;
	}

	// AS3: sources/win63_version/habbo/ui/widget/chatinput/RoomChatInputWidget.as::getChatInputElements()
	public getChatInputElements(): IWindow[] | null
	{
		return this._view?.getChatWindowElements() ?? null;
	}

	// AS3: sources/win63_version/habbo/ui/widget/chatinput/RoomChatInputWidget.as::release()
	public override release(): void
	{
		this.hide();
		this._desktop = null;

		super.release();
	}

	// AS3: sources/win63_version/habbo/ui/widget/chatinput/RoomChatInputWidget.as::reuse()
	public override reuse(desktop: IRoomDesktop): void
	{
		super.reuse(desktop);

		this._desktop = desktop;
		this.show();
	}
}

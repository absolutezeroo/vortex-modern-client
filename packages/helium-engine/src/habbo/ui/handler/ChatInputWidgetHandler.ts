/**
 * ChatInputWidgetHandler
 *
 * @see sources/win63_version/habbo/ui/handler/ChatInputWidgetHandler.as
 *
 * TODO(AS3): the AS3 handler's RWCM_MESSAGE_CHAT case also parses ~50 slash
 * commands (:kick, :mute, :zoom, :fps, :cam, :wired, :reload, :pickall, etc.)
 * covering moderation/wired-menu/room-engine-debug features that don't exist
 * in this port yet. Only the normal chat-send path (speak/whisper/shout) is
 * wired here; slash commands pass through as literal chat text for now.
 * getProcessedEvents() similarly omits FBE_BAR_RESIZE_EVENT (friend bar isn't
 * wired) and hrwe_hide_room_widget (no generic hide-widget event bus yet).
 */
import type {IRoomWidgetHandler} from '@habbo/ui/IRoomWidgetHandler';
import type {IRoomWidgetHandlerContainer} from '@habbo/ui/IRoomWidgetHandlerContainer';
import type {RoomWidgetMessage} from '@habbo/ui/widget/messages/RoomWidgetMessage';
import type {RoomWidgetUpdateEvent} from '@habbo/ui/widget/events/RoomWidgetUpdateEvent';
import {RoomWidgetChatMessage} from '@habbo/ui/widget/messages/RoomWidgetChatMessage';
import {RoomWidgetChatTypingMessage} from '@habbo/ui/widget/messages/RoomWidgetChatTypingMessage';
import {RoomWidgetFloodControlEvent} from '@habbo/ui/widget/events/RoomWidgetFloodControlEvent';
import type {RoomChatInputWidget} from '@habbo/ui/widget/chatinput/RoomChatInputWidget';
import type {RoomSessionChatEvent} from '@habbo/session/events/RoomSessionChatEvent';

export class ChatInputWidgetHandler implements IRoomWidgetHandler
{
	private _disposed: boolean = false;
	private _container: IRoomWidgetHandlerContainer | null = null;
	private _widget: RoomChatInputWidget | null = null;

	// AS3: sources/win63_version/habbo/ui/handler/ChatInputWidgetHandler.as::get container() / set container()
	public get container(): IRoomWidgetHandlerContainer | null
	{
		return this._container;
	}

	public set container(value: IRoomWidgetHandlerContainer | null)
	{
		this._container = value;
	}

	// AS3: sources/win63_version/habbo/ui/handler/ChatInputWidgetHandler.as::set widget()
	public set widget(value: RoomChatInputWidget | null)
	{
		this._widget = value;
	}

	// AS3: sources/win63_version/habbo/ui/handler/ChatInputWidgetHandler.as::get disposed()
	public get disposed(): boolean
	{
		return this._disposed;
	}

	// AS3: sources/win63_version/habbo/ui/handler/ChatInputWidgetHandler.as::get type()
	public get type(): string
	{
		return 'RWE_CHAT_INPUT_WIDGET';
	}

	// AS3: sources/win63_version/habbo/ui/handler/ChatInputWidgetHandler.as::dispose()
	public dispose(): void
	{
		this._disposed = true;
		this._container = null;
		this._widget = null;
	}

	// AS3: sources/win63_version/habbo/ui/handler/ChatInputWidgetHandler.as::getWidgetMessages()
	public getWidgetMessages(): string[]
	{
		return ['RWCTM_TYPING_STATUS', 'RWCM_MESSAGE_CHAT', 'RWCSAM_MESSAGE_SELECT_AVATAR'];
	}

	// AS3: sources/win63_version/habbo/ui/handler/ChatInputWidgetHandler.as::processWidgetMessage()
	public processWidgetMessage(message: RoomWidgetMessage): RoomWidgetUpdateEvent | null
	{
		switch(message.type)
		{
			case 'RWCTM_TYPING_STATUS':
			{
				const typingMessage = message as RoomWidgetChatTypingMessage;

				this._container?.roomSession?.sendChatTypingMessage(typingMessage.isTyping);
				break;
			}

			case 'RWCM_MESSAGE_CHAT':
			{
				if(!this._container?.roomSession) break;

				const chatMessage = message as RoomWidgetChatMessage;

				if(!chatMessage.text) return null;

				switch(chatMessage.chatType)
				{
					case RoomWidgetChatMessage.CHAT_TYPE_WHISPER:
						this._container.roomSession.sendWhisperMessage(chatMessage.recipientName, chatMessage.text, chatMessage.styleId);
						break;
					case RoomWidgetChatMessage.CHAT_TYPE_SHOUT:
						this._container.roomSession.sendShoutMessage(chatMessage.text, chatMessage.styleId);
						break;
					default:
						this._container.roomSession.sendChatMessage(chatMessage.text, chatMessage.styleId);
						break;
				}

				break;
			}

			case 'RWCSAM_MESSAGE_SELECT_AVATAR':
				// TODO(AS3): IRoomEngine.selectAvatar() (the "@Name" mention-autocomplete
				// avatar picker) isn't ported yet.
				break;
		}

		return null;
	}

	// AS3: sources/win63_version/habbo/ui/handler/ChatInputWidgetHandler.as::getProcessedEvents()
	public getProcessedEvents(): string[]
	{
		return ['RSCE_FLOOD_EVENT'];
	}

	public update(): void
	{
	}

	// AS3: sources/win63_version/habbo/ui/handler/ChatInputWidgetHandler.as::processEvent()
	public processEvent(event: unknown): void
	{
		if(!this._container?.desktopEvents) return;

		const typedEvent = event as {type?: string};

		if(typedEvent.type === 'RSCE_FLOOD_EVENT')
		{
			const seconds = parseInt((event as RoomSessionChatEvent).text, 10);

			this._container.desktopEvents.emit(
				RoomWidgetFloodControlEvent.FLOOD_CONTROL,
				new RoomWidgetFloodControlEvent(Number.isNaN(seconds) ? 0 : seconds)
			);
		}
	}
}

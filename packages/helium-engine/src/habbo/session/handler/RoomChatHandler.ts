import type {IConnection} from '@core/communication/connection/IConnection';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {IRoomHandlerListener} from '../IRoomHandlerListener';
import {BaseHandler} from './BaseHandler';

// Message events
import {ChatMessageEvent} from '../../communication/messages/incoming/room/chat/ChatMessageEvent';
import {ShoutMessageEvent} from '../../communication/messages/incoming/room/chat/ShoutMessageEvent';
import {WhisperMessageEvent} from '../../communication/messages/incoming/room/chat/WhisperMessageEvent';

// Parsers
import type {ChatMessageEventParser} from '../../communication/messages/parser/room/chat/ChatMessageEventParser';

// Events
import {RoomSessionChatEvent} from '../events/RoomSessionChatEvent';

/**
 * Room chat handler
 *
 * Based on AS3: com.sulake.habbo.session.handler.RoomChatHandler
 *
 * Handles chat messages (ChatMessageEvent, WhisperMessageEvent, ShoutMessageEvent)
 * and dispatches RoomSessionChatEvent.
 */
export class RoomChatHandler extends BaseHandler
{
	private _messageEvents: IMessageEvent[] = [];

	constructor(connection: IConnection | null, listener: IRoomHandlerListener)
	{
		super(connection, listener);

		if (connection === null)
		{
			return;
		}

		// Register chat message events
		this.addMessageEvent(connection, new ChatMessageEvent(this.onRoomChat.bind(this)));
		this.addMessageEvent(connection, new WhisperMessageEvent(this.onRoomWhisper.bind(this)));
		this.addMessageEvent(connection, new ShoutMessageEvent(this.onRoomShout.bind(this)));

		// TODO: Register additional message events when implemented
		// this.addMessageEvent(connection, new RespectNotificationMessageEvent(this.onRespectNotification.bind(this)));
		// this.addMessageEvent(connection, new FloodControlMessageEvent(this.onFloodControl.bind(this)));
	}

	override dispose(): void
	{
		if (this.connection)
		{
			for (const event of this._messageEvents)
			{
				this.connection.removeMessageEvent(event);
			}
		}
		this._messageEvents = [];

		super.dispose();
	}

	private addMessageEvent(connection: IConnection, event: IMessageEvent): void
	{
		connection.addMessageEvent(event);
		this._messageEvents.push(event);
	}

	/**
	 * Helper method to dispatch a chat event
	 */
	private dispatchChatEvent(
		userId: number,
		text: string,
		chatType: number,
		styleId: number,
		links: string[] | null = null,
		extraParam: number = -1
	): void
	{
		const session = this.listener.getSession(this.roomId);
		if (session === null)
		{
			return;
		}

		if (this.listener.sessionEvents)
		{
			this.listener.sessionEvents.emit(
				RoomSessionChatEvent.RSCE_CHAT_EVENT,
				new RoomSessionChatEvent(
					RoomSessionChatEvent.RSCE_CHAT_EVENT,
					session,
					userId,
					text,
					chatType,
					styleId,
					links,
					extraParam
				)
			);
		}
	}

	/**
	 * Handle normal chat message
	 */
	private onRoomChat(event: IMessageEvent): void
	{
		const chatEvent = event as ChatMessageEvent;
		if (chatEvent === null)
		{
			return;
		}

		const parser = chatEvent.parser as ChatMessageEventParser;
		if (parser === null)
		{
			return;
		}

		// Convert links array to string array if present
		let links: string[] | null = null;
		if (parser.links !== null)
		{
			links = parser.links.map(link => link.displayText);
		}

		this.dispatchChatEvent(
			parser.userId,
			parser.text,
			RoomSessionChatEvent.CHAT_TYPE_SPEAK,
			parser.styleId,
			links
		);
	}

	/**
	 * Handle whisper message
	 */
	private onRoomWhisper(event: IMessageEvent): void
	{
		const whisperEvent = event as WhisperMessageEvent;
		if (whisperEvent === null)
		{
			return;
		}

		const parser = whisperEvent.parser as ChatMessageEventParser;
		if (parser === null)
		{
			return;
		}

		// Convert links array to string array if present
		let links: string[] | null = null;
		if (parser.links !== null)
		{
			links = parser.links.map(link => link.displayText);
		}

		this.dispatchChatEvent(
			parser.userId,
			parser.text,
			RoomSessionChatEvent.CHAT_TYPE_WHISPER,
			parser.styleId,
			links
		);
	}

	/**
	 * Handle shout message
	 */
	private onRoomShout(event: IMessageEvent): void
	{
		const shoutEvent = event as ShoutMessageEvent;
		if (shoutEvent === null)
		{
			return;
		}

		const parser = shoutEvent.parser as ChatMessageEventParser;
		if (parser === null)
		{
			return;
		}

		// Convert links array to string array if present
		let links: string[] | null = null;
		if (parser.links !== null)
		{
			links = parser.links.map(link => link.displayText);
		}

		this.dispatchChatEvent(
			parser.userId,
			parser.text,
			RoomSessionChatEvent.CHAT_TYPE_SHOUT,
			parser.styleId,
			links
		);
	}
}

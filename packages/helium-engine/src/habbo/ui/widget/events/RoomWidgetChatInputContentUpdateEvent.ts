/**
 * RoomWidgetChatInputContentUpdateEvent
 *
 * @see sources/win63_version/habbo/ui/widget/events/RoomWidgetChatInputContentUpdateEvent.as
 */
import {RoomWidgetUpdateEvent} from './RoomWidgetUpdateEvent';

export class RoomWidgetChatInputContentUpdateEvent extends RoomWidgetUpdateEvent
{
	public static readonly CHAT_INPUT_CONTENT: string = 'RWWCIDE_CHAT_INPUT_CONTENT';
	public static readonly MESSAGE_TYPE_WHISPER: string = 'whisper';
	public static readonly MESSAGE_TYPE_SHOUT: string = 'shout';

	private _messageType: string;
	private _userName: string;

	// AS3: sources/win63_version/habbo/ui/widget/events/RoomWidgetChatInputContentUpdateEvent.as::RoomWidgetChatInputContentUpdateEvent()
	constructor(messageType: string, userName: string = '')
	{
		super('RWWCIDE_CHAT_INPUT_CONTENT');

		this._messageType = messageType;
		this._userName = userName;
	}

	public get messageType(): string
	{
		return this._messageType;
	}

	public get userName(): string
	{
		return this._userName;
	}
}

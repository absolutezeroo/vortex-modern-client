/**
 * RoomWidgetChatMessage
 *
 * @see sources/win63_version/habbo/ui/widget/messages/RoomWidgetChatMessage.as
 */
import {RoomWidgetMessage} from './RoomWidgetMessage';

export class RoomWidgetChatMessage extends RoomWidgetMessage
{
    public static readonly WIDGET_MESSAGE_CHAT: string = 'RWCM_MESSAGE_CHAT';
    public static readonly CHAT_TYPE_SPEAK: number = 0;
    public static readonly CHAT_TYPE_WHISPER: number = 1;
    public static readonly CHAT_TYPE_SHOUT: number = 2;

    private _chatType: number;
    private _text: string;
    private _recipientName: string;
    private _styleId: number;

    // AS3: sources/win63_version/habbo/ui/widget/messages/RoomWidgetChatMessage.as::RoomWidgetChatMessage()
    constructor(type: string, text: string, chatType: number = 0, recipientName: string = '', styleId: number = 0)
    {
        super(type);

        this._text = text;
        this._chatType = chatType;
        this._recipientName = recipientName;
        this._styleId = styleId;
    }

    public get chatType(): number
    {
        return this._chatType;
    }

    public get text(): string
    {
        return this._text;
    }

    public get recipientName(): string
    {
        return this._recipientName;
    }

    public get styleId(): number
    {
        return this._styleId;
    }
}

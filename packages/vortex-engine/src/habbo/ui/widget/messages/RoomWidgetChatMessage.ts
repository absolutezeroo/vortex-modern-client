/**
 * RoomWidgetChatMessage
 *
 * @see sources/win63_version/habbo/ui/widget/messages/RoomWidgetChatMessage.as
 */
import {RoomWidgetMessage} from './RoomWidgetMessage';

export class RoomWidgetChatMessage extends RoomWidgetMessage
{
    // AS3: sources/win63_version/habbo/ui/widget/messages/RoomWidgetChatMessage.as::WIDGET_MESSAGE_CHAT
    public static readonly WIDGET_MESSAGE_CHAT: string = 'RWCM_MESSAGE_CHAT';
    // AS3: sources/win63_version/habbo/ui/widget/messages/RoomWidgetChatMessage.as::CHAT_TYPE_SPEAK
    public static readonly CHAT_TYPE_SPEAK: number = 0;
    // AS3: sources/win63_version/habbo/ui/widget/messages/RoomWidgetChatMessage.as::CHAT_TYPE_WHISPER
    public static readonly CHAT_TYPE_WHISPER: number = 1;
    // AS3: sources/win63_version/habbo/ui/widget/messages/RoomWidgetChatMessage.as::CHAT_TYPE_SHOUT
    public static readonly CHAT_TYPE_SHOUT: number = 2;

    private _chatType: number;
    // AS3: sources/win63_version/habbo/ui/widget/messages/RoomWidgetChatMessage.as::_text
    private _text: string;
    // AS3: sources/win63_version/habbo/ui/widget/messages/RoomWidgetChatMessage.as::_recipientName
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

    // AS3: sources/win63_version/habbo/ui/widget/messages/RoomWidgetChatMessage.as::get chatType()
    public get chatType(): number
    {
        return this._chatType;
    }

    // AS3: sources/win63_version/habbo/ui/widget/messages/RoomWidgetChatMessage.as::get text()
    public get text(): string
    {
        return this._text;
    }

    // AS3: sources/win63_version/habbo/ui/widget/messages/RoomWidgetChatMessage.as::get recipientName()
    public get recipientName(): string
    {
        return this._recipientName;
    }

    // AS3: sources/win63_version/habbo/ui/widget/messages/RoomWidgetChatMessage.as::get styleId()
    public get styleId(): number
    {
        return this._styleId;
    }
}

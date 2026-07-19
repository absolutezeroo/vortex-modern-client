/**
 * RoomWidgetChatTypingMessage
 *
 * @see sources/win63_version/habbo/ui/widget/messages/RoomWidgetChatTypingMessage.as
 */
import {RoomWidgetMessage} from './RoomWidgetMessage';

export class RoomWidgetChatTypingMessage extends RoomWidgetMessage
{
    public static readonly TYPING_STATUS: string = 'RWCTM_TYPING_STATUS';

    private _isTyping: boolean;

    // AS3: sources/win63_version/habbo/ui/widget/messages/RoomWidgetChatTypingMessage.as::RoomWidgetChatTypingMessage()
    constructor(isTyping: boolean)
    {
        super('RWCTM_TYPING_STATUS');

        this._isTyping = isTyping;
    }

    public get isTyping(): boolean
    {
        return this._isTyping;
    }
}

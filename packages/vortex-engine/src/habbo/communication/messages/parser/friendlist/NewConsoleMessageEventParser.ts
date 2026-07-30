import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {ChatMessageContent} from './ChatMessageContent';

/**
 * Parser for new console (messenger) message events.
 * Contains the chat message data including sender information.
 *
 * @see source_as_win63/habbo/communication/messages/parser/friendlist/NewConsoleMessageEventParser.as
 */
export class NewConsoleMessageEventParser implements IMessageParser
{
    private _chatId: number = 0;

    get chatId(): number
    {
        return this._chatId;
    }

    // AS3: .../_SafePkg_1755/_SafeCls_1887.as::_content
    private _content: ChatMessageContent = new ChatMessageContent(ChatMessageContent.TYPE_TEXT);

    // AS3: .../_SafePkg_1755/_SafeCls_1887.as::get content()
    get content(): ChatMessageContent
    {
        return this._content;
    }

    // AS3: .../_SafePkg_1755/_SafeCls_1887.as::get messageText()
    get messageText(): string
    {
        return this._content.messageText;
    }

    /** Zero for a text message, one for a habbicon - the discriminator, straight through. */
    // AS3: .../_SafePkg_1755/_SafeCls_1887.as::get messageType()
    get messageType(): number
    {
        return this._content.messageType;
    }

    // AS3: .../_SafePkg_1755/_SafeCls_1887.as::get habbiconId()
    get habbiconId(): number
    {
        return this._content.habbiconId;
    }

    private _secondsSinceSent: number = 0;

    get secondsSinceSent(): number
    {
        return this._secondsSinceSent;
    }

    private _messageId: string = '';

    get messageId(): string
    {
        return this._messageId;
    }

    private _confirmationId: number = 0;

    get confirmationId(): number
    {
        return this._confirmationId;
    }

    private _senderId: number = 0;

    get senderId(): number
    {
        return this._senderId;
    }

    private _senderName: string = '';

    get senderName(): string
    {
        return this._senderName;
    }

    private _senderFigure: string = '';

    get senderFigure(): string
    {
        return this._senderFigure;
    }

    flush(): boolean
    {
        this._chatId = 0;
        this._content = new ChatMessageContent(ChatMessageContent.TYPE_TEXT);
        this._secondsSinceSent = 0;
        this._messageId = '';
        this._confirmationId = 0;
        this._senderId = 0;
        this._senderName = '';
        this._senderFigure = '';
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._chatId = wrapper.readInt();

        // Same content object as the history entry, and the same bug: reading a bare
        // string here consumed the discriminator as a length and misaligned every
        // remaining field of the message - sender, confirmation id and all.
        this._content = ChatMessageContent.parse(wrapper);

        this._secondsSinceSent = wrapper.readInt();
        this._messageId = wrapper.readString();
        this._confirmationId = wrapper.readInt();
        this._senderId = wrapper.readInt();
        this._senderName = wrapper.readString();
        this._senderFigure = wrapper.readString();

        return true;
    }
}

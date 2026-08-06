import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {ChatMessageContent} from './ChatMessageContent';

/**
 * Data class for a single history message entry.
 * Represents one message in a conversation history fragment.
 *
 * @see sources/win63_version/habbo/communication/messages/incoming/friendlist/class_3449.as
 */
export class HistoryMessageEntry
{
    constructor(wrapper: IMessageDataWrapper)
    {
        this._senderId = wrapper.readInt();
        this._senderName = wrapper.readString();
        this._senderFigure = wrapper.readString();

        // Not a string. AS3 parses a content object here - an int discriminator, then the
        // text or a habbicon id - and reading a bare string took the discriminator's bytes
        // as a length. Entries arrive as an array, so from the second one on the sender id
        // was being read out of the previous entry's tail.
        this._content = ChatMessageContent.parse(wrapper);

        this._secondsSinceSent = wrapper.readInt();
        this._messageId = wrapper.readString();
    }

    // AS3: .../_SafePkg_1764/_SafeCls_3273.as::_content
    private _content: ChatMessageContent;

    // AS3: .../_SafePkg_1764/_SafeCls_3273.as::get content()
    get content(): ChatMessageContent
    {
        return this._content;
    }

    // AS3: .../_SafePkg_1764/_SafeCls_3273.as::get messageType()
    get messageType(): number
    {
        return this._content.messageType;
    }

    // AS3: .../_SafePkg_1764/_SafeCls_3273.as::get habbiconId()
    get habbiconId(): number
    {
        return this._content.habbiconId;
    }

    private _senderId: number;

    // AS3: sources/win63_version/habbo/communication/messages/incoming/friendlist/class_3449.as::get senderId()
    get senderId(): number
    {
        return this._senderId;
    }

    // AS3: sources/win63_version/habbo/communication/messages/incoming/friendlist/class_3449.as::_senderName
    private _senderName: string;

    // AS3: sources/win63_version/habbo/communication/messages/incoming/friendlist/class_3449.as::get senderName()
    get senderName(): string
    {
        return this._senderName;
    }

    private _senderFigure: string;

    // AS3: sources/win63_version/habbo/communication/messages/incoming/friendlist/class_3449.as::get senderFigure()
    get senderFigure(): string
    {
        return this._senderFigure;
    }

    // AS3: .../_SafePkg_1764/_SafeCls_3273.as::get message()
    get message(): string
    {
        return this._content.messageText;
    }

    private _secondsSinceSent: number;

    // AS3: sources/win63_version/habbo/communication/messages/incoming/friendlist/class_3449.as::get secondsSinceSent()
    get secondsSinceSent(): number
    {
        return this._secondsSinceSent;
    }

    private _messageId: string;

    // AS3: sources/win63_version/habbo/communication/messages/incoming/friendlist/class_3449.as::get messageId()
    get messageId(): string
    {
        return this._messageId;
    }
}

/**
 * Parser for console message history events.
 * Contains a fragment of conversation history for a given chat.
 *
 * @see source_as_win63/habbo/communication/messages/parser/friendlist/ConsoleMessageHistoryEventParser.as
 */
export class ConsoleMessageHistoryEventParser implements IMessageParser
{
    private _chatId: number = 0;

    // AS3: sources/win63_version/habbo/communication/messages/parser/friendlist/ConsoleMessageHistoryEventParser.as::get chatId()
    get chatId(): number
    {
        return this._chatId;
    }

    private _historyFragment: HistoryMessageEntry[] = [];

    // AS3: sources/win63_version/habbo/communication/messages/parser/friendlist/ConsoleMessageHistoryEventParser.as::get historyFragment()
    get historyFragment(): HistoryMessageEntry[]
    {
        return this._historyFragment;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/friendlist/ConsoleMessageHistoryEventParser.as::flush()
    flush(): boolean
    {
        this._chatId = 0;
        this._historyFragment = [];
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/friendlist/ConsoleMessageHistoryEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._chatId = wrapper.readInt();
        this._historyFragment = [];

        const count = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            this._historyFragment.push(new HistoryMessageEntry(wrapper));
        }

        return true;
    }
}

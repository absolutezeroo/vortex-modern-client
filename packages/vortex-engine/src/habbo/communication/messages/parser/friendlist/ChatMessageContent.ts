import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * The wire form of a chat message's body: a discriminator, then either the text or a
 * habbicon id.
 *
 * Both `NewConsoleMessage` and `ConsoleMessageHistory` embed this where their parsers used
 * to read a bare string. That is not a cosmetic difference — the discriminator is an
 * integer on the wire, so reading a string in its place takes the wrong bytes and every
 * field after it is misaligned. In the history message, whose entries arrive as an array,
 * the misalignment compounds: from the second entry on, the sender id is read out of the
 * previous entry's trailing bytes. Same failure mode as the friend snapshot's missing
 * `realName`.
 *
 * `_SafeCls_3241` in the primary tree, in `_SafePkg_1764`, and recovered by no tree — it
 * postdates the 2016 build. **The name `ChatMessageContent` is derived**, from what it
 * parses and from `_SafeCls_3273.content`, the accessor that returns it. Its members are
 * real names.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1764/_SafeCls_3241.as
 */
export class ChatMessageContent
{
    /** **Name derived** from its value; the same pair as `ChatBubbleMessage`. */
    // AS3: .../_SafePkg_1764/_SafeCls_3241.as::TYPE_TEXT
    static readonly TYPE_TEXT: number = 0;

    /** **Name derived** from its value; the same pair as `ChatBubbleMessage`. */
    // AS3: .../_SafePkg_1764/_SafeCls_3241.as::TYPE_HABBICON
    static readonly TYPE_HABBICON: number = 1;

    // AS3: .../_SafePkg_1764/_SafeCls_3241.as::_SafeCls_3241()
    constructor(messageType: number, messageText: string = '', habbiconId: number = 0)
    {
        this._messageType = messageType;
        this._messageText = messageText;
        this._habbiconId = habbiconId;
    }

    /**
     * An unknown discriminator consumes nothing further and yields an empty text message.
     * That is AS3's own default branch, and it is deliberate: the server would have to send
     * a kind this build does not know, and guessing at a payload length would desync the
     * rest of the packet worse than an empty message does.
     */
    // AS3: .../_SafePkg_1764/_SafeCls_3241.as::parse()
    static parse(wrapper: IMessageDataWrapper): ChatMessageContent
    {
        const messageType = wrapper.readInt();

        switch(messageType)
        {
            case ChatMessageContent.TYPE_TEXT:
                return new ChatMessageContent(ChatMessageContent.TYPE_TEXT, wrapper.readString(), 0);

            case ChatMessageContent.TYPE_HABBICON:
                return new ChatMessageContent(ChatMessageContent.TYPE_HABBICON, '', wrapper.readInt());

            default:
                return new ChatMessageContent(ChatMessageContent.TYPE_TEXT, '', 0);
        }
    }

    private _messageType: number;

    // AS3: .../_SafePkg_1764/_SafeCls_3241.as::get messageType()
    get messageType(): number
    {
        return this._messageType;
    }

    private _messageText: string;

    // AS3: .../_SafePkg_1764/_SafeCls_3241.as::get messageText()
    get messageText(): string
    {
        return this._messageText;
    }

    private _habbiconId: number;

    // AS3: .../_SafePkg_1764/_SafeCls_3241.as::get habbiconId()
    get habbiconId(): number
    {
        return this._habbiconId;
    }
}

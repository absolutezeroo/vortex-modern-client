import {ChatBubbleMessage} from '@habbo/window/widgets/ChatBubbleMessage';

/**
 * One entry in a conversation: a chat line from either side, or one of the three
 * generated notices the messenger inserts itself.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/messenger/ChatEntry.as
 */
export class ChatEntry
{
    // AS3: .../messenger/ChatEntry.as::TYPE_OWN_CHAT
    static readonly TYPE_OWN_CHAT: number = 1;

    // AS3: .../messenger/ChatEntry.as::TYPE_OTHER_CHAT
    static readonly TYPE_OTHER_CHAT: number = 2;

    /**
     * The moderation blurb and the persisted-messages notice — `recordNotificationMessage()`.
     * **Name derived**; obfuscated in every tree. Not a room invite: that is
     * `TYPE_INVITATION` below, and conflating the two is what the previous
     * `TYPE_ROOM_INVITE`/`TYPE_ROOM_INVITE_COMBO` pair did.
     */
    // AS3: .../messenger/ChatEntry.as::TYPE_NOTIFICATION
    static readonly TYPE_NOTIFICATION: number = 3;

    // AS3: .../messenger/ChatEntry.as::TYPE_INFO
    static readonly TYPE_INFO: number = 4;

    /** **Name derived** from `recordInvitationMessage()`; obfuscated in every tree. */
    // AS3: .../messenger/ChatEntry.as::TYPE_INVITATION
    static readonly TYPE_INVITATION: number = 5;

    // AS3: .../messenger/ChatEntry.as::ChatEntry()
    constructor(
        type: number,
        chatId: number,
        message: ChatBubbleMessage,
        seconds: number,
        senderId: number = 0,
        senderName: string | null = null,
        senderFigure: string | null = null,
        messageId: string = '',
        awaitConfirmationId: number = 0
    )
    {
        this._type = type;
        this._chatId = chatId;
        this._message = message;
        this._seconds = seconds;
        this._clientReceiveTime = performance.now();
        this._awaitConfirmationId = awaitConfirmationId;
        this._messageId = messageId;
        this._senderId = senderId;
        this._senderName = senderName;
        this._senderFigure = senderFigure;
    }

    // AS3: .../messenger/ChatEntry.as::_SafeStr_9522
    private _seconds: number;

    // AS3: .../messenger/ChatEntry.as::_clientReceiveTime
    private _clientReceiveTime: number;

    private _type: number;

    // AS3: .../messenger/ChatEntry.as::get type()
    get type(): number
    {
        return this._type;
    }

    private _chatId: number;

    // AS3: .../messenger/ChatEntry.as::get chatId()
    get chatId(): number
    {
        return this._chatId;
    }

    private _message: ChatBubbleMessage;

    // AS3: .../messenger/ChatEntry.as::get message()
    get message(): ChatBubbleMessage
    {
        return this._message;
    }

    // AS3: .../messenger/ChatEntry.as::get messageText()
    get messageText(): string
    {
        return this._message.type === ChatBubbleMessage.TYPE_TEXT ? this._message.textValue : '';
    }

    private _awaitConfirmationId: number;

    // AS3: .../messenger/ChatEntry.as::get awaitConfirmationId()
    get awaitConfirmationId(): number
    {
        return this._awaitConfirmationId;
    }

    private _messageId: string;

    // AS3: .../messenger/ChatEntry.as::get messageId()
    get messageId(): string
    {
        return this._messageId;
    }

    private _senderId: number;

    // AS3: .../messenger/ChatEntry.as::get senderId()
    get senderId(): number
    {
        return this._senderId;
    }

    // AS3: .../src/com/sulake/habbo/messenger/ChatEntry.as::_senderName
    private _senderName: string | null;

    // AS3: .../messenger/ChatEntry.as::get senderName()
    get senderName(): string | null
    {
        return this._senderName;
    }

    private _senderFigure: string | null;

    // AS3: .../messenger/ChatEntry.as::get senderFigure()
    get senderFigure(): string | null
    {
        return this._senderFigure;
    }

    /**
     * The server's age for the message, plus however long it has sat in this client since.
     */
    // AS3: .../messenger/ChatEntry.as::get secondsSinceSent()
    get secondsSinceSent(): number
    {
        const localElapsed = Math.floor((performance.now() - this._clientReceiveTime) / 1000);

        return this._seconds + localElapsed;
    }

    // AS3: .../messenger/ChatEntry.as::sentTimeStamp()
    sentTimeStamp(): number
    {
        return Date.now() - this.secondsSinceSent * 1000;
    }

    /**
     * A habbicon has no text to prefix, so AS3 leaves it alone rather than turning it into
     * a text message. Kept.
     */
    // AS3: .../messenger/ChatEntry.as::prefixMessageWith()
    prefixMessageWith(prefix: string): void
    {
        if(this._message.type === ChatBubbleMessage.TYPE_TEXT)
        {
            this._message = ChatBubbleMessage.text(`${prefix}\n${this.messageText}`);
        }
    }

    // AS3: .../messenger/ChatEntry.as::isAwaitingConfirmation()
    isAwaitingConfirmation(): boolean
    {
        return this._awaitConfirmationId !== 0;
    }

    /**
     * The server echoed the message back with its real id, so the optimistic copy stops
     * awaiting confirmation and takes the server's text.
     */
    // AS3: .../messenger/ChatEntry.as::isConfirmed()
    isConfirmed(message: ChatBubbleMessage, messageId: string): void
    {
        this._awaitConfirmationId = 0;
        this._message = message;
        this._messageId = messageId;
    }
}

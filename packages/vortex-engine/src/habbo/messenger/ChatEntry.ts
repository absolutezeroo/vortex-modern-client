/**
 * Represents a single chat entry in a messenger conversation.
 * Tracks message data, timing, and confirmation state.
 *
 * @see source_as_win63/habbo/messenger/ChatEntry.as
 */
export class ChatEntry
{
    public static readonly TYPE_OWN_CHAT: number = 1;
    public static readonly TYPE_OTHER_CHAT: number = 2;
    public static readonly TYPE_ROOM_INVITE: number = 3;
    public static readonly TYPE_INFO: number = 4;
    public static readonly TYPE_ROOM_INVITE_COMBO: number = 5;
    private _seconds: number;
    private _clientReceiveTime: number;

    constructor(
        type: number,
        chatId: number,
        message: string,
        seconds: number,
        senderId: number = 0,
        senderName: string = '',
        senderFigure: string = '',
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

    private _type: number;

    get type(): number
    {
        return this._type;
    }

    private _chatId: number;

    get chatId(): number
    {
        return this._chatId;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/messenger/ChatEntry.as::message
    // TODO(AS3): AS3's message is a typed _SafeCls_2676 (type 0 = plain text, other values =
    // structured content like room invites) with a static _SafeCls_2676.text() factory - this port
    // simplifies it to a plain string, so there is no type discriminator to gate on. ChatEntry has
    // zero constructors/callers anywhere in this port today, so this is undocumented rather than
    // observably wrong; a real fix needs the typed wrapper, not a guess at its shape.
    private _message: string;

    get message(): string
    {
        return this._message;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/messenger/ChatEntry.as::get messageText()
    // AS3 returns "" for a non-text message (type != 0); this port's message is always plain text
    // under the current simplification (see the TODO on `message` above), so it's returned as-is.
    get messageText(): string
    {
        return this._message;
    }

    private _awaitConfirmationId: number;

    get awaitConfirmationId(): number
    {
        return this._awaitConfirmationId;
    }

    private _messageId: string;

    get messageId(): string
    {
        return this._messageId;
    }

    private _senderId: number;

    get senderId(): number
    {
        return this._senderId;
    }

    private _senderName: string;

    get senderName(): string
    {
        return this._senderName;
    }

    private _senderFigure: string;

    get senderFigure(): string
    {
        return this._senderFigure;
    }

    /**
	 * Computes the total seconds elapsed since the message was sent,
	 * accounting for both the server-reported delay and local time elapsed.
	 */
    get secondsSinceSent(): number
    {
        const localElapsed = Math.floor((performance.now() - this._clientReceiveTime) / 1000);
        return this._seconds + localElapsed;
    }

    /**
	 * Returns the estimated timestamp (in ms) when the message was sent.
	 */
    sentTimeStamp(): number
    {
        return Date.now() - this.secondsSinceSent * 1000;
    }

    /**
	 * Prepends a prefix string to the message with a newline separator.
	 *
	 * @param prefix - The prefix to prepend
	 */
    // TODO(AS3): sources/WIN63-202607011411-782849652/src/com/sulake/habbo/messenger/ChatEntry.as::prefixMessageWith()
    // AS3 only prefixes when message.type === 0 (plain text) - a room-invite or other structured
    // message is left alone. Same simplified-message gap as `message`/`messageText` above; always
    // prefixing is the current (undocumented-until-now) behavior.
    prefixMessageWith(prefix: string): void
    {
        this._message = prefix + '\n' + this._message;
    }

    /**
	 * Returns whether this entry is still awaiting confirmation from the server.
	 */
    isAwaitingConfirmation(): boolean
    {
        return this._awaitConfirmationId !== 0;
    }

    /**
	 * Marks this entry as confirmed by the server, updating the message and ID.
	 *
	 * @param message - The confirmed message text
	 * @param messageId - The server-assigned message ID
	 */
    isConfirmed(message: string, messageId: string): void
    {
        this._awaitConfirmationId = 0;
        this._message = message;
        this._messageId = messageId;
    }
}

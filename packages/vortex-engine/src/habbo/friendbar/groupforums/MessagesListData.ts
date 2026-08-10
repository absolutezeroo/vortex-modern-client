import type {ForumMessage} from '@habbo/communication/messages/parser/groupforums/ForumMessage';

/**
 * One page of posts inside a thread, plus an id index over it.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/groupforums/MessagesListData.as
 */
export class MessagesListData
{
    // AS3: MessagesListData.as::_threadId
    private _threadId: number;

    // AS3: MessagesListData.as::_startIndex
    private _startIndex: number;

    // AS3: MessagesListData.as::_totalMessages
    private _totalMessages: number;

    // AS3: MessagesListData.as::_messages
    private _messages: ForumMessage[];

    // AS3: MessagesListData.as::_messagesById (a flash.utils.Dictionary)
    private _messagesById: Map<number, ForumMessage>;

    // AS3: MessagesListData.as::MessagesListData()
    // Argument order is AS3's: the total comes *before* the start index, unlike ThreadsListData.
    constructor(threadId: number, totalMessages: number, startIndex: number, messages: ForumMessage[])
    {
        this._threadId = threadId;
        this._totalMessages = totalMessages;
        this._startIndex = startIndex;
        this._messages = messages;
        this._messagesById = new Map();

        for(const message of messages)
        {
            this._messagesById.set(message.messageId, message);
        }
    }

    // AS3: MessagesListData.as::get threadId()
    get threadId(): number
    {
        return this._threadId;
    }

    // AS3: MessagesListData.as::get startIndex()
    get startIndex(): number
    {
        return this._startIndex;
    }

    // AS3: MessagesListData.as::get totalMessages()
    get totalMessages(): number
    {
        return this._totalMessages;
    }

    // AS3: MessagesListData.as::get messages()
    get messages(): ForumMessage[]
    {
        return this._messages;
    }

    // AS3: MessagesListData.as::get messagesById()
    get messagesById(): Map<number, ForumMessage>
    {
        return this._messagesById;
    }

    // AS3: MessagesListData.as::get size()
    get size(): number
    {
        return this._messages.length;
    }
}

import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {ForumThread} from './ForumThread';

/**
 * One group's forum, as it appears in a forums list.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2470/_SafeCls_3303.as
 * (readable as `class_3590` in win63_version — names taken from there, wire order from the
 * primary tree, which is the only one whose bodies can be trusted.)
 *
 * `unreadMessages` is stored as a *count back from the end*, not an id: `lastReadMessageId` is
 * derived from it and writing that accessor converts back. Keeping the server's own field means
 * `addNewThread()` can bump the totals without re-deriving anything.
 */
export class ForumData
{
    // AS3: _SafeCls_3303.as::_groupId
    protected _groupId: number = 0;

    // AS3: _SafeCls_3303.as::_name
    protected _name: string = '';

    // AS3: _SafeCls_3303.as::_description
    protected _description: string = '';

    // AS3: _SafeCls_3303.as::_icon
    protected _icon: string = '';

    // AS3: _SafeCls_3303.as::_totalThreads
    protected _totalThreads: number = 0;

    // AS3: _SafeCls_3303.as::_leaderboardScore
    protected _leaderboardScore: number = 0;

    // AS3: _SafeCls_3303.as::_totalMessages
    protected _totalMessages: number = 0;

    // AS3: _SafeCls_3303.as::_unreadMessages
    protected _unreadMessages: number = 0;

    // AS3: _SafeCls_3303.as::_lastMessageId
    protected _lastMessageId: number = 0;

    // AS3: _SafeCls_3303.as::_lastMessageAuthorId
    protected _lastMessageAuthorId: number = 0;

    // AS3: _SafeCls_3303.as::_lastMessageAuthorName
    protected _lastMessageAuthorName: string = '';

    // AS3: _SafeCls_3303.as::_lastMessageTimeAsSecondsAgo
    protected _lastMessageTimeAsSecondsAgo: number = 0;

    // AS3: _SafeCls_3303.as::readFromMessage()
    static readFromMessage(wrapper: IMessageDataWrapper): ForumData
    {
        return ForumData.fillFromMessage(new ForumData(), wrapper);
    }

    /**
     * AS3: _SafeCls_3303.as::fillFromMessage()
     *
     * `internal` in AS3 so the permissions subclass can fill the base half of its own payload
     * before reading its extra fields; `protected static` is the nearest TS equivalent that keeps
     * that single caller working.
     */
    // AS3: _SafeCls_3303.as::fillFromMessage()
    protected static fillFromMessage<T extends ForumData>(target: T, wrapper: IMessageDataWrapper): T
    {
        target._groupId = wrapper.readInt();
        target._name = wrapper.readString();
        target._description = wrapper.readString();
        target._icon = wrapper.readString();
        target._totalThreads = wrapper.readInt();
        target._leaderboardScore = wrapper.readInt();
        target._totalMessages = wrapper.readInt();
        target._unreadMessages = wrapper.readInt();
        target._lastMessageId = wrapper.readInt();
        target._lastMessageAuthorId = wrapper.readInt();
        target._lastMessageAuthorName = wrapper.readString();
        target._lastMessageTimeAsSecondsAgo = wrapper.readInt();

        return target;
    }

    // AS3: _SafeCls_3303.as::get groupId()
    get groupId(): number
    {
        return this._groupId;
    }

    // AS3: _SafeCls_3303.as::get name()
    get name(): string
    {
        return this._name;
    }

    // AS3: _SafeCls_3303.as::get description()
    get description(): string
    {
        return this._description;
    }

    // AS3: _SafeCls_3303.as::get icon()
    get icon(): string
    {
        return this._icon;
    }

    // AS3: _SafeCls_3303.as::get totalThreads()
    get totalThreads(): number
    {
        return this._totalThreads;
    }

    // AS3: _SafeCls_3303.as::get leaderboardScore()
    get leaderboardScore(): number
    {
        return this._leaderboardScore;
    }

    // AS3: _SafeCls_3303.as::get totalMessages()
    get totalMessages(): number
    {
        return this._totalMessages;
    }

    // AS3: _SafeCls_3303.as::get unreadMessages()
    get unreadMessages(): number
    {
        return this._unreadMessages;
    }

    // AS3: _SafeCls_3303.as::get lastMessageId()
    get lastMessageId(): number
    {
        return this._lastMessageId;
    }

    // AS3: _SafeCls_3303.as::get lastMessageAuthorId()
    get lastMessageAuthorId(): number
    {
        return this._lastMessageAuthorId;
    }

    // AS3: _SafeCls_3303.as::get lastMessageAuthorName()
    get lastMessageAuthorName(): string
    {
        return this._lastMessageAuthorName;
    }

    // AS3: _SafeCls_3303.as::get lastMessageTimeAsSecondsAgo()
    get lastMessageTimeAsSecondsAgo(): number
    {
        return this._lastMessageTimeAsSecondsAgo;
    }

    // AS3: _SafeCls_3303.as::get lastReadMessageId()
    get lastReadMessageId(): number
    {
        return this._totalMessages - this._unreadMessages;
    }

    // AS3: _SafeCls_3303.as::set lastReadMessageId()
    set lastReadMessageId(value: number)
    {
        this._unreadMessages = this._totalMessages - value;

        if(this._unreadMessages < 0) this._unreadMessages = 0;
    }

    /**
     * AS3: _SafeCls_3303.as::updateFrom()
     *
     * Copies only the counters and the last-message summary — never the identity fields
     * (groupId/name/description/icon), which a refresh is not allowed to change.
     */
    // AS3: _SafeCls_3303.as::updateFrom()
    updateFrom(other: ForumData): void
    {
        this._totalThreads = other._totalThreads;
        this._totalMessages = other._totalMessages;
        this._unreadMessages = other._unreadMessages;
        this._lastMessageAuthorId = other._lastMessageAuthorId;
        this._lastMessageAuthorName = other._lastMessageAuthorName;
        this._lastMessageId = other._lastMessageId;
        this._lastMessageTimeAsSecondsAgo = other._lastMessageTimeAsSecondsAgo;
    }

    /**
     * AS3: _SafeCls_3303.as::addNewThread()
     *
     * Applied locally when this client posts a thread, so the list updates without a round trip.
     * `unreadMessages` goes to 0 because the poster has by definition read their own post.
     */
    // AS3: _SafeCls_3303.as::addNewThread()
    addNewThread(thread: ForumThread): void
    {
        this._lastMessageAuthorId = thread.lastMessageAuthorId;
        this._lastMessageAuthorName = thread.lastMessageAuthorName;
        this._lastMessageId = thread.lastMessageId;
        this._lastMessageTimeAsSecondsAgo = thread.lastMessageTimeAsSecondsAgo;
        this._totalThreads++;
        this._totalMessages++;
        this._unreadMessages = 0;
    }
}

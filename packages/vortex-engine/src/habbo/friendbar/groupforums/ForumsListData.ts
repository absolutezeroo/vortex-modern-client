import type {ForumData} from '@habbo/communication/messages/parser/groupforums/ForumData';
import type {ForumsListMessageParser} from '@habbo/communication/messages/parser/groupforums/ForumsListMessageParser';

/**
 * The client-side copy of one forums page, taken off the parser so the view can outlive the
 * message (a parser is flushed and reused for the next one).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/groupforums/ForumsListData.as
 */
export class ForumsListData
{
    // AS3: ForumsListData.as::_listCode
    private _listCode: number;

    // AS3: ForumsListData.as::_totalAmount
    private _totalAmount: number;

    // AS3: ForumsListData.as::_startIndex
    private _startIndex: number;

    // AS3: ForumsListData.as::_forums
    private _forums: ForumData[];

    // AS3: ForumsListData.as::ForumsListData()
    constructor(parser: ForumsListMessageParser)
    {
        this._listCode = parser.listCode;
        this._totalAmount = parser.totalAmount;
        this._startIndex = parser.startIndex;
        this._forums = parser.forums;
    }

    // AS3: ForumsListData.as::get listCode()
    get listCode(): number
    {
        return this._listCode;
    }

    // AS3: ForumsListData.as::get totalAmount()
    get totalAmount(): number
    {
        return this._totalAmount;
    }

    // AS3: ForumsListData.as::get startIndex()
    get startIndex(): number
    {
        return this._startIndex;
    }

    // AS3: ForumsListData.as::get forums()
    get forums(): ForumData[]
    {
        return this._forums;
    }

    /**
     * AS3: ForumsListData.as::get unreadForumsCount()
     *
     * How many forums on *this page* have anything unread — not the hotel-wide figure, which is
     * its own message (UnreadForumsCountMessageEvent).
     */
    // AS3: ForumsListData.as::get unreadForumsCount()
    get unreadForumsCount(): number
    {
        let count = 0;

        for(const forum of this._forums)
        {
            if(forum.unreadMessages > 0) count++;
        }

        return count;
    }

    // AS3: ForumsListData.as::getForumData()
    getForumData(groupId: number): ForumData | null
    {
        for(const forum of this._forums)
        {
            if(forum.groupId === groupId) return forum;
        }

        return null;
    }

    /**
     * AS3: ForumsListData.as::updateUnreadMessages()
     *
     * Folds a freshly-received forum record into the one already on the page, then marks it read
     * up to `lastReadMessageId`. `updateFrom()` deliberately copies only the counters, so the
     * page's identity fields survive.
     */
    // AS3: ForumsListData.as::updateUnreadMessages()
    updateUnreadMessages(forum: ForumData, lastReadMessageId: number): void
    {
        const existing = this.getForumData(forum.groupId);

        if(existing === null) return;

        existing.updateFrom(forum);
        existing.lastReadMessageId = lastReadMessageId;
    }
}

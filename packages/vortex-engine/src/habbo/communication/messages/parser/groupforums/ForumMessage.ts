import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * One post inside a thread.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2470/_SafeCls_3561.as
 * (readable as `class_2670` in win63_version)
 *
 * `messageIndex` is the post's position in the thread, which is what paging works on — distinct
 * from `messageId`, its server identity.
 */
export class ForumMessage
{
    // AS3: _SafeCls_3561.as::messageId
    messageId: number = 0;

    /**
     * A second name for `messageId`, capital M and all.
     *
     * AS3 declares both accessor pairs over the same `_SafeStr_7387`, and never reads this one.
     * Kept as an accessor rather than a field so the two cannot drift apart, which is the one
     * thing the AS3 shape guarantees and a duplicated field would not.
     */
    // AS3: _SafeCls_3561.as::get MessageId()
    get MessageId(): number
    {
        return this.messageId;
    }

    // AS3: _SafeCls_3561.as::set MessageId()
    set MessageId(value: number)
    {
        this.messageId = value;
    }

    /**
     * Dead in AS3 too: `readFromMessage()` never writes it and nothing reads it. The value the
     * wire actually carries is `creationTimeAsSecondsAgo`, below.
     */
    // AS3: _SafeCls_3561.as::creationTime
    creationTime: number = 0;

    // AS3: _SafeCls_3561.as::messageIndex
    messageIndex: number = 0;

    // AS3: _SafeCls_3561.as::authorId
    authorId: number = 0;

    // AS3: _SafeCls_3561.as::authorName
    authorName: string = '';

    // AS3: _SafeCls_3561.as::authorFigure
    authorFigure: string = '';

    // AS3: _SafeCls_3561.as::creationTimeAsSecondsAgo
    creationTimeAsSecondsAgo: number = 0;

    // AS3: _SafeCls_3561.as::messageText
    messageText: string = '';

    // AS3: _SafeCls_3561.as::state
    state: number = 0;

    // AS3: _SafeCls_3561.as::adminId
    adminId: number = 0;

    // AS3: _SafeCls_3561.as::adminName
    adminName: string = '';

    // AS3: _SafeCls_3561.as::adminOperationTimeAsSeccondsAgo
    // The double "c" is AS3's own spelling, on this class only — the thread record next to it
    // spells the same field correctly. Kept so the two can be diffed against the source.
    adminOperationTimeAsSeccondsAgo: number = 0;

    // AS3: _SafeCls_3561.as::authorPostCount
    authorPostCount: number = 0;

    /**
     * Which forum and thread this post belongs to. Neither is on the wire for a post — the
     * ThreadMessages parser stamps both onto every record it reads, from the ids that framed the
     * list. AS3 spells the first `groupID`, unlike every other `groupId` in the module.
     */
    // AS3: _SafeCls_3561.as::set groupID()
    groupID: number = 0;

    // AS3: _SafeCls_3561.as::threadId
    threadId: number = 0;

    // AS3: _SafeCls_3561.as::readFromMessage()
    static readFromMessage(wrapper: IMessageDataWrapper): ForumMessage
    {
        const message = new ForumMessage();

        message.messageId = wrapper.readInt();
        message.messageIndex = wrapper.readInt();
        message.authorId = wrapper.readInt();
        message.authorName = wrapper.readString();
        message.authorFigure = wrapper.readString();
        message.creationTimeAsSecondsAgo = wrapper.readInt();
        message.messageText = wrapper.readString();
        message.state = wrapper.readByte();
        message.adminId = wrapper.readInt();
        message.adminName = wrapper.readString();
        message.adminOperationTimeAsSeccondsAgo = wrapper.readInt();
        message.authorPostCount = wrapper.readInt();

        return message;
    }
}

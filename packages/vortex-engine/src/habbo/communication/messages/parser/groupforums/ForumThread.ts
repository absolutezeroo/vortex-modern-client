import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * One thread in a group forum.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2470/_SafeCls_3284.as
 * (readable as `class_3434` in win63_version)
 *
 * `state` is a byte, not an int — a thread that has been hidden or locked by a moderator carries
 * who did it and how long ago in the three `admin*` fields that follow.
 */
export class ForumThread
{
    // AS3: _SafeCls_3284.as::threadId
    threadId: number = 0;

    // AS3: _SafeCls_3284.as::threadAuthorId
    threadAuthorId: number = 0;

    // AS3: _SafeCls_3284.as::threadAuthorName
    threadAuthorName: string = '';

    // AS3: _SafeCls_3284.as::header
    header: string = '';

    // AS3: _SafeCls_3284.as::isSticky
    isSticky: boolean = false;

    // AS3: _SafeCls_3284.as::isLocked
    isLocked: boolean = false;

    // AS3: _SafeCls_3284.as::creationTimeAsSecondsAgo
    creationTimeAsSecondsAgo: number = 0;

    // AS3: _SafeCls_3284.as::nMessages
    nMessages: number = 0;

    // AS3: _SafeCls_3284.as::nUnreadMessages
    nUnreadMessages: number = 0;

    // AS3: _SafeCls_3284.as::lastMessageId
    lastMessageId: number = 0;

    // AS3: _SafeCls_3284.as::lastMessageAuthorId
    lastMessageAuthorId: number = 0;

    // AS3: _SafeCls_3284.as::lastMessageAuthorName
    lastMessageAuthorName: string = '';

    // AS3: _SafeCls_3284.as::lastMessageTimeAsSecondsAgo
    lastMessageTimeAsSecondsAgo: number = 0;

    // AS3: _SafeCls_3284.as::state
    state: number = 0;

    // AS3: _SafeCls_3284.as::adminId
    adminId: number = 0;

    // AS3: _SafeCls_3284.as::adminName
    adminName: string = '';

    // AS3: _SafeCls_3284.as::adminOperationTimeAsSecondsAgo
    adminOperationTimeAsSecondsAgo: number = 0;

    // AS3: _SafeCls_3284.as::readFromMessage()
    static readFromMessage(wrapper: IMessageDataWrapper): ForumThread
    {
        const thread = new ForumThread();

        thread.threadId = wrapper.readInt();
        thread.threadAuthorId = wrapper.readInt();
        thread.threadAuthorName = wrapper.readString();
        thread.header = wrapper.readString();
        thread.isSticky = wrapper.readBoolean();
        thread.isLocked = wrapper.readBoolean();
        thread.creationTimeAsSecondsAgo = wrapper.readInt();
        thread.nMessages = wrapper.readInt();
        thread.nUnreadMessages = wrapper.readInt();
        thread.lastMessageId = wrapper.readInt();
        thread.lastMessageAuthorId = wrapper.readInt();
        thread.lastMessageAuthorName = wrapper.readString();
        thread.lastMessageTimeAsSecondsAgo = wrapper.readInt();
        thread.state = wrapper.readByte();
        thread.adminId = wrapper.readInt();
        thread.adminName = wrapper.readString();
        thread.adminOperationTimeAsSecondsAgo = wrapper.readInt();

        return thread;
    }
}

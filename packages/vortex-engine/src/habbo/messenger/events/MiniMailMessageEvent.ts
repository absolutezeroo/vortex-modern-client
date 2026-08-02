/**
 * Dispatched when MiniMail state changes: a new message arrived, or the server sent the
 * authoritative unread count.
 *
 * The event type is not stored — it is the key `HabboMessenger` emits on, matching this
 * module's other event class (`ActiveConversationEvent`), where AS3 gets it from
 * `flash.events.Event`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/messenger/events/MiniMailMessageEvent.as
 */
export class MiniMailMessageEvent
{
    // AS3: .../messenger/events/MiniMailMessageEvent.as::NEW_MESSAGE_NOTIFICATION
    public static readonly NEW_MESSAGE_NOTIFICATION: string = 'MMME_new';

    /**
     * The constant's identifier is obfuscated in every tree (`_SafeStr_11142`) — only its
     * value, `MMME_unread`, is recovered, and this name is derived from it.
     */
    // AS3: .../messenger/events/MiniMailMessageEvent.as::_SafeStr_11142
    public static readonly UNREAD_MESSAGE_COUNT: string = 'MMME_unread';

    // AS3: .../messenger/events/MiniMailMessageEvent.as::MiniMailMessageEvent()
    constructor(type: string, unreadCount: number = -1)
    {
        this._unreadCount = unreadCount;
    }

    // AS3: .../messenger/events/MiniMailMessageEvent.as::_SafeStr_9710
    private _unreadCount: number;

    // AS3: .../messenger/events/MiniMailMessageEvent.as::get unreadCount()
    get unreadCount(): number
    {
        return this._unreadCount;
    }
}

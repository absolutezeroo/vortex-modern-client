/**
 * Event dispatched for mini mail message notifications.
 * Indicates new or unread mini mail messages.
 *
 * @see source_as_win63/habbo/messenger/events/MiniMailMessageEvent.as
 */
export class MiniMailMessageEvent
{
    public static readonly NEW: string = 'MMME_new';
    public static readonly UNREAD: string = 'MMME_unread';

    constructor(type: string, unreadCount: number = -1)
    {
        this._unreadCount = unreadCount;
    }

    private _unreadCount: number;

    get unreadCount(): number
    {
        return this._unreadCount;
    }
}

/**
 * Event dispatched when the active conversation count changes.
 * Used to update UI indicators for open conversations.
 *
 * @see source_as_win63/habbo/messenger/events/ActiveConversationEvent.as
 */
export class ActiveConversationEvent
{
    public static readonly ACTIVE_CONVERSATION_COUNT_CHANGED: string = 'ACCE_changed';

    constructor(type: string, count: number, hasUnread: boolean)
    {
        this._activeConversationsCount = count;
        this._hasUnread = hasUnread;
    }

    private _activeConversationsCount: number;

    get activeConversationsCount(): number
    {
        return this._activeConversationsCount;
    }

    private _hasUnread: boolean;

    get hasUnread(): boolean
    {
        return this._hasUnread;
    }
}

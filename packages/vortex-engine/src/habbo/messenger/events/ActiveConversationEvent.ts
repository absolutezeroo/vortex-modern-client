/**
 * Event dispatched when the active conversation count changes.
 * Used to update UI indicators for open conversations.
 *
 * @see source_as_win63/habbo/messenger/events/ActiveConversationEvent.as
 */
export class ActiveConversationEvent
{
    // AS3: .../src/com/sulake/habbo/messenger/events/ActiveConversationEvent.as::ACTIVE_CONVERSATION_COUNT_CHANGED
    public static readonly ACTIVE_CONVERSATION_COUNT_CHANGED: string = 'ACCE_changed';

    constructor(type: string, count: number, hasUnread: boolean)
    {
        this._activeConversationsCount = count;
        this._hasUnread = hasUnread;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/messenger/events/ActiveConversationEvent.as::_activeConversationsCount
    private _activeConversationsCount: number;

    // AS3: .../src/com/sulake/habbo/messenger/events/ActiveConversationEvent.as::get activeConversationsCount()
    get activeConversationsCount(): number
    {
        return this._activeConversationsCount;
    }

    // AS3: .../src/com/sulake/habbo/messenger/events/ActiveConversationEvent.as::_hasUnread
    private _hasUnread: boolean;

    // AS3: .../src/com/sulake/habbo/messenger/events/ActiveConversationEvent.as::get hasUnread()
    get hasUnread(): boolean
    {
        return this._hasUnread;
    }
}

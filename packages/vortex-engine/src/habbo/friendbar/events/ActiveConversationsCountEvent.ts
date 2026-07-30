/**
 * ActiveConversationsCountEvent
 *
 * Relays the messenger's own conversation count to the bar, which shows it on the
 * messenger token.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/events/ActiveConversationsCountEvent.as
 */
export class ActiveConversationsCountEvent
{
    // AS3: .../events/ActiveConversationsCountEvent.as::ACTIVE_MESSENGER_CONVERSATION_EVENT
    static readonly ACTIVE_MESSENGER_CONVERSATION_EVENT: string = 'AMC_EVENT';

    // AS3: .../events/ActiveConversationsCountEvent.as::ActiveConversationsCountEvent()
    constructor(activeConversationsCount: number, hasUnread: boolean)
    {
        this._activeConversationsCount = activeConversationsCount;
        this._hasUnread = hasUnread;
    }

    // AS3: .../events/ActiveConversationsCountEvent.as::_SafeStr_8956
    private _activeConversationsCount: number;

    // AS3: .../events/ActiveConversationsCountEvent.as::get activeConversationsCount()
    get activeConversationsCount(): number
    {
        return this._activeConversationsCount;
    }

    // AS3: .../events/ActiveConversationsCountEvent.as::_hasUnread
    private _hasUnread: boolean;

    // AS3: .../events/ActiveConversationsCountEvent.as::get hasUnread()
    get hasUnread(): boolean
    {
        return this._hasUnread;
    }

    // AS3: flash.events.Event::get type()
    get type(): string
    {
        return ActiveConversationsCountEvent.ACTIVE_MESSENGER_CONVERSATION_EVENT;
    }
}

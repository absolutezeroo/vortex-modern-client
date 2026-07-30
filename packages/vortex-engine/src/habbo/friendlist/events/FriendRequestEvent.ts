/**
 * FriendRequestEvent
 *
 * Emitted on the manager's own event bus when a request is accepted or declined, so
 * anything outside the friend list (the toolbar's badge, notifications) can drop its
 * copy of the request without listening to the wire.
 *
 * AS3 extends `flash.events.Event` and dispatches it; this port's components carry an
 * eventemitter3 bus instead, so the class is a plain payload emitted under its type —
 * the same shape every other ported event in this codebase uses.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendlist/events/FriendRequestEvent.as
 */
export class FriendRequestEvent
{
    // AS3: .../events/FriendRequestEvent.as::ACCEPTED
    static readonly ACCEPTED: string = 'FRE_ACCEPTED';

    // AS3: .../events/FriendRequestEvent.as::DECLINED
    static readonly DECLINED: string = 'FRE_DECLINED';

    // AS3: .../events/FriendRequestEvent.as::FriendRequestEvent()
    constructor(type: string, requestId: number)
    {
        this._type = type;
        this._requestId = requestId;
    }

    // AS3: flash.events.Event::type
    private _type: string;

    // AS3: flash.events.Event::get type()
    get type(): string
    {
        return this._type;
    }

    // AS3: .../events/FriendRequestEvent.as::_SafeStr_7451
    private _requestId: number;

    // AS3: .../events/FriendRequestEvent.as::get requestId()
    get requestId(): number
    {
        return this._requestId;
    }
}

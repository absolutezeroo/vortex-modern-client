/**
 * Fired on the controller's own bus whenever the unread-forums badge count changes, so the friend
 * bar can repaint without polling.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/groupforums/UnseenForumsCountUpdatedEvent.as
 */
export class UnseenForumsCountUpdatedEvent
{
    // AS3: .../src/com/sulake/habbo/friendbar/groupforums/UnseenForumsCountUpdatedEvent.as::TYPE
    public static readonly TYPE: string = 'UNSEEN_FORUMS_COUNT';

    // AS3: .../groupforums/UnseenForumsCountUpdatedEvent.as::_unseenForumsCount
    private _unseenForumsCount: number;

    // TS-only: `flash.events.Event` carries the type on the instance; the port's EventEmitter takes
    // it as the emit key instead, so the field is kept only for the ported `type` getter below.
    private _type: string;

    // AS3: .../groupforums/UnseenForumsCountUpdatedEvent.as::UnseenForumsCountUpdatedEvent()
    constructor(type: string, unseenForumsCount: number)
    {
        this._type = type;
        this._unseenForumsCount = unseenForumsCount;
    }

    // TS-only: stands in for `flash.events.Event::type`, which AS3 gets from the base class.
    get type(): string
    {
        return this._type;
    }

    // AS3: .../groupforums/UnseenForumsCountUpdatedEvent.as::get unseenForumsCount()
    get unseenForumsCount(): number
    {
        return this._unseenForumsCount;
    }
}

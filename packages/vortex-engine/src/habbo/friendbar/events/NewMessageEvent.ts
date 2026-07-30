/**
 * NewMessageEvent
 *
 * An instant message arrived, or a conversation was opened from the bar.
 *
 * `notify` is false when the messenger is already open — the bar then only moves the
 * sender's slot, without flashing it.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/events/NewMessageEvent.as
 */
export class NewMessageEvent
{
    // AS3: .../events/NewMessageEvent.as::NEW_INSTANT_MESSAGE
    static readonly NEW_INSTANT_MESSAGE: string = 'FBE_MESSAGE';

    // AS3: .../events/NewMessageEvent.as::NewMessageEvent()
    constructor(notify: boolean, senderId: number)
    {
        this.notify = notify;
        this.senderId = senderId;
    }

    // AS3: .../events/NewMessageEvent.as::notify
    notify: boolean;

    // AS3: .../events/NewMessageEvent.as::senderId
    senderId: number;

    // AS3: flash.events.Event::get type()
    get type(): string
    {
        return NewMessageEvent.NEW_INSTANT_MESSAGE;
    }
}

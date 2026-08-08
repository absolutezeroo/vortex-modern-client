import {RoomWidgetUpdateEvent} from './RoomWidgetUpdateEvent';

/**
 * "There is mini-mail news" — and nothing more: neither type carries a count or a message. The
 * me-menu reads the actual numbers off the messenger itself; this only tells it to look.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/events/RoomWidgetMiniMailUpdateEvent.as
 */
export class RoomWidgetMiniMailUpdateEvent extends RoomWidgetUpdateEvent
{
    // AS3: .../widget/events/RoomWidgetMiniMailUpdateEvent.as::NEW_MESSAGE_NOTIFICATION
    public static readonly NEW_MESSAGE_NOTIFICATION: string = 'RWMMUE_new_mini_mail';

    // AS3: .../widget/events/RoomWidgetMiniMailUpdateEvent.as::UNREAD_MESSAGE_COUNT
    // Name DERIVED (`_SafeStr_11011`), from its value — and matching the name already recovered
    // for `MiniMailMessageEvent.UNREAD_MESSAGE_COUNT`, whose event this one relays.
    public static readonly UNREAD_MESSAGE_COUNT: string = 'RWMMUE_unread_mini_mail';

    // AS3: .../widget/events/RoomWidgetMiniMailUpdateEvent.as::RoomWidgetMiniMailUpdateEvent()
    // The two Flash Event flags AS3 forwards are dropped — see RoomWidgetHabboClubUpdateEvent.
    constructor(type: string)
    {
        super(type);
    }
}

import {RoomWidgetUpdateEvent} from './RoomWidgetUpdateEvent';

/**
 * "The room's user list changed" — no payload, just a nudge to re-read it.
 *
 * Note the lower-case type string; AS3 writes it that way and event names are matched literally.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/events/RoomWidgetUserDataUpdateEvent.as
 */
export class RoomWidgetUserDataUpdateEvent extends RoomWidgetUpdateEvent
{
    // AS3: RoomWidgetUserDataUpdateEvent.as::USER_DATA_UPDATED
    public static readonly USER_DATA_UPDATED: string = 'rwudue_user_data_updated';

    // AS3: RoomWidgetUserDataUpdateEvent.as::RoomWidgetUserDataUpdateEvent()
    constructor()
    {
        super(RoomWidgetUserDataUpdateEvent.USER_DATA_UPDATED);
    }
}

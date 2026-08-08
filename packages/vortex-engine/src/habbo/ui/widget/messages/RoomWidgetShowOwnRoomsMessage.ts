import {RoomWidgetMessage} from './RoomWidgetMessage';

/**
 * "Open the navigator on my own rooms." No payload — the navigator knows who you are.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/messages/RoomWidgetShowOwnRoomsMessage.as
 */
export class RoomWidgetShowOwnRoomsMessage extends RoomWidgetMessage
{
    // AS3: .../widget/messages/RoomWidgetShowOwnRoomsMessage.as::SHOW_OWN_ROOMS
    public static readonly SHOW_OWN_ROOMS: string = 'RWSORM_SHOW_OWN_ROOMS';

    // AS3: .../widget/messages/RoomWidgetShowOwnRoomsMessage.as::RoomWidgetShowOwnRoomsMessage()
    // The type is fixed; the constructor takes nothing.
    constructor()
    {
        super(RoomWidgetShowOwnRoomsMessage.SHOW_OWN_ROOMS);
    }
}

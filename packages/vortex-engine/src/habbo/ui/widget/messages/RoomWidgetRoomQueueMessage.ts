import {RoomWidgetMessage} from './RoomWidgetMessage';

/**
 * What the queue window's buttons ask for. It carries nothing but its own type — the handler
 * decides what each one means.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/messages/RoomWidgetRoomQueueMessage.as
 */
export class RoomWidgetRoomQueueMessage extends RoomWidgetMessage
{
    // AS3: .../RoomWidgetRoomQueueMessage.as::EXIT_QUEUE
    // Name DERIVED (`_SafeStr_11658`), from its value.
    static readonly EXIT_QUEUE: string = 'RWRQM_EXIT_QUEUE';

    // AS3: .../RoomWidgetRoomQueueMessage.as::CHANGE_TO_VISITOR_QUEUE
    static readonly CHANGE_TO_VISITOR_QUEUE: string = 'RWRQM_CHANGE_TO_VISITOR_QUEUE';

    // AS3: .../RoomWidgetRoomQueueMessage.as::CHANGE_TO_SPECTATOR_QUEUE
    static readonly CHANGE_TO_SPECTATOR_QUEUE: string = 'RWRQM_CHANGE_TO_SPECTATOR_QUEUE';

    // AS3: .../RoomWidgetRoomQueueMessage.as::CLUB_LINK
    // Name DERIVED (`_SafeStr_11682`), from its value.
    static readonly CLUB_LINK: string = 'RWRQM_CLUB_LINK';
}

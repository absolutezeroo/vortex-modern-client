import {RoomWidgetUpdateEvent} from '../events/RoomWidgetUpdateEvent';

/**
 * "The inventory changed" — raised when the server sends a furni-list add/update (3151).
 *
 * It lives under `messages/` and extends `RoomWidgetUpdateEvent`, not `RoomWidgetMessage`: AS3 has
 * it that way, and it is dispatched on the event bus rather than handed to `processWidgetMessage()`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/messages/RoomWidgetInventoryUpdatedMessage.as
 */
export class RoomWidgetInventoryUpdatedMessage extends RoomWidgetUpdateEvent
{
    // AS3: RoomWidgetInventoryUpdatedMessage.as::INVENTORY_UPDATED
    public static readonly INVENTORY_UPDATED: string = 'RWIUM_INVENTORY_UPDATED';

    // AS3: RoomWidgetInventoryUpdatedMessage.as::RoomWidgetInventoryUpdatedMessage()
    constructor(type: string)
    {
        super(type);
    }
}

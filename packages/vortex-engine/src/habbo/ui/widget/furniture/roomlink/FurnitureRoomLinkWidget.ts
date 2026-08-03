import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IRoomWidgetHandler} from '@habbo/ui/IRoomWidgetHandler';
import {RoomWidgetBase} from '@habbo/ui/widget/RoomWidgetBase';

/**
 * FurnitureRoomLinkWidget
 *
 * Empty by design — AS3's is too. A room-link furni has no window of its own: the handler
 * does everything (look the room up, confirm, navigate), and this exists only so the widget
 * type can be created and its handler registered.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/furniture/roomlink/FurnitureRoomLinkWidget.as
 */
export class FurnitureRoomLinkWidget extends RoomWidgetBase
{
    // AS3: .../roomlink/FurnitureRoomLinkWidget.as::FurnitureRoomLinkWidget()
    constructor(handler: IRoomWidgetHandler, windowManager: IHabboWindowManager)
    {
        super(handler, windowManager);
    }
}

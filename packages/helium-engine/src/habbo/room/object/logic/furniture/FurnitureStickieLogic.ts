/**
 * FurnitureStickieLogic
 *
 * Based on AS3: com.sulake.habbo.room.object.logic.furniture.FurnitureStickieLogic
 *
 * Logic for sticky note furniture.
 */
import {FurnitureLogic} from './FurnitureLogic';
import {RoomObjectWidgetRequestEvent} from '@habbo/room/events/RoomObjectWidgetRequestEvent';

export class FurnitureStickieLogic extends FurnitureLogic
{
    constructor()
    {
        super();
        this.widgetType = 'stickie';
    }

    override useObject(): void
    {
        if(this.object === null || this.eventDispatcher === null)
        {
            return;
        }

        // Open sticky note widget
        this.eventDispatcher.emit(
            RoomObjectWidgetRequestEvent.ROWRE_OPEN_WIDGET,
            new RoomObjectWidgetRequestEvent(RoomObjectWidgetRequestEvent.ROWRE_OPEN_WIDGET, this.object)
        );
    }
}

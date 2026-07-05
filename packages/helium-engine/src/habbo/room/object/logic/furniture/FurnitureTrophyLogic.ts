/**
 * FurnitureTrophyLogic
 *
 * Based on AS3: com.sulake.habbo.room.object.logic.furniture.FurnitureTrophyLogic
 *
 * Logic for trophy furniture.
 */
import {FurnitureLogic} from './FurnitureLogic';
import {RoomObjectWidgetRequestEvent} from '@habbo/room/events/RoomObjectWidgetRequestEvent';

export class FurnitureTrophyLogic extends FurnitureLogic
{
    constructor()
    {
        super();
        this.widgetType = 'trophy';
    }

    override useObject(): void
    {
        if(this.object === null || this.eventDispatcher === null)
        {
            return;
        }

        // Open trophy widget
        this.eventDispatcher.emit(
            RoomObjectWidgetRequestEvent.ROWRE_OPEN_WIDGET,
            new RoomObjectWidgetRequestEvent(RoomObjectWidgetRequestEvent.ROWRE_OPEN_WIDGET, this.object)
        );
    }
}

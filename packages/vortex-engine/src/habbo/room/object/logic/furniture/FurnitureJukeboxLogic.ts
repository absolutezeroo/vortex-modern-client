/**
 * FurnitureJukeboxLogic
 *
 * Based on AS3: com.sulake.habbo.room.object.logic.furniture.FurnitureJukeboxLogic
 *
 * Logic for jukebox furniture.
 */
import {FurnitureMultiStateLogic} from './FurnitureMultiStateLogic';
import {RoomObjectWidgetRequestEvent} from '@habbo/room/events/RoomObjectWidgetRequestEvent';

export class FurnitureJukeboxLogic extends FurnitureMultiStateLogic
{
    constructor()
    {
        super();
        this.widgetType = 'jukebox';
    }

    override useObject(): void
    {
        if(this.object === null || this.eventDispatcher === null)
        {
            return;
        }

        // Open jukebox widget
        this.eventDispatcher.emit(
            RoomObjectWidgetRequestEvent.ROWRE_OPEN_WIDGET,
            new RoomObjectWidgetRequestEvent(RoomObjectWidgetRequestEvent.ROWRE_OPEN_WIDGET, this.object)
        );
    }
}

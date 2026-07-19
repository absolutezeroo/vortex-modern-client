/**
 * FurnitureRoomDimmerLogic
 *
 * Based on AS3: com.sulake.habbo.room.object.logic.furniture.FurnitureRoomDimmerLogic
 *
 * Logic for room dimmer/mood light furniture.
 */
import {FurnitureLogic} from './FurnitureLogic';
import {RoomObjectWidgetRequestEvent} from '@habbo/room/events/RoomObjectWidgetRequestEvent';

export class FurnitureRoomDimmerLogic extends FurnitureLogic
{
    constructor()
    {
        super();
        this.widgetType = 'dimmer';
    }

    override initialize(data: unknown): void
    {
        super.initialize(data);

        const model = this.object?.getModelController();
        model?.setNumber('furniture_uses_plane_mask', 0, true);
        model?.setNumber('furniture_plane_mask_type', 1, true);
    }

    override useObject(): void
    {
        if(this.object === null || this.eventDispatcher === null)
        {
            return;
        }

        // Open dimmer widget
        this.eventDispatcher.emit(
            RoomObjectWidgetRequestEvent.ROWRE_OPEN_WIDGET,
            new RoomObjectWidgetRequestEvent(RoomObjectWidgetRequestEvent.ROWRE_OPEN_WIDGET, this.object)
        );
    }
}

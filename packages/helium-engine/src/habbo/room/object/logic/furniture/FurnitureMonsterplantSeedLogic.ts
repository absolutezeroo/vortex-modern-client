/**
 * FurnitureMonsterplantSeedLogic
 *
 * @see source_as_flash/com/sulake/habbo/room/object/logic/furniture/FurnitureMonsterplantSeedLogic.as
 *
 * Logic for monsterplant seed furniture (context menu = MONSTERPLANT_SEED).
 */
import {FurnitureMultiStateLogic} from './FurnitureMultiStateLogic';
import {RoomObjectWidgetRequestEvent} from '@habbo/room/events/RoomObjectWidgetRequestEvent';

export class FurnitureMonsterplantSeedLogic extends FurnitureMultiStateLogic
{
    override get contextMenu(): string | null
    {
        return 'MONSTERPLANT_SEED';
    }

    override getEventTypes(): string[]
    {
        return this.getAllEventTypes(super.getEventTypes(), [
            RoomObjectWidgetRequestEvent.ROWRE_MONSTERPLANT_SEED_PLANT_CONFIRMATION_DIALOG
        ]);
    }

    override useObject(): void
    {
        if(this.eventDispatcher !== null && this.object !== null)
        {
            this.eventDispatcher.emit(
                RoomObjectWidgetRequestEvent.ROWRE_MONSTERPLANT_SEED_PLANT_CONFIRMATION_DIALOG,
                new RoomObjectWidgetRequestEvent(RoomObjectWidgetRequestEvent.ROWRE_MONSTERPLANT_SEED_PLANT_CONFIRMATION_DIALOG, this.object)
            );
        }
    }
}

/**
 * FurnitureMonsterplantSeedLogic
 *
 * The logic behind a monsterplant seed standing in a room. It adds nothing to the multi-state
 * furniture it extends beyond two ways of reaching the same dialog: `contextMenu` names the seed
 * bubble the context-menu widget builds, and `useObject()` — a double click — asks for the plant
 * confirmation directly, skipping the bubble.
 *
 * Neither path talks to the server: `MonsterPlantSeedConfirmationView` is the only thing that
 * sends, through RWUPM_MONSTERPLANT_SEED.
 *
 * The class is obfuscated in the primary tree (`_SafeCls_1723`); it is identified by the
 * "MONSTERPLANT_SEED" its `contextMenu` returns, which FurnitureContextMenuWidgetHandler switches
 * on. The unobfuscated name is recovered from the 2016 tree, which still has the class under its
 * own name: `PRODUCTION-201601012205-226667486/.../furniture/FurnitureMonsterplantSeedLogic.as`.
 * `win63_version` does not help here — it has no monsterplant seed file at all.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/object/logic/furniture/_SafeCls_1723.as
 */
import {FurnitureMultiStateLogic} from './FurnitureMultiStateLogic';
import {RoomObjectWidgetRequestEvent} from '@habbo/room/events/RoomObjectWidgetRequestEvent';

export class FurnitureMonsterplantSeedLogic extends FurnitureMultiStateLogic
{
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/object/logic/furniture/_SafeCls_1723.as::get contextMenu()
    override get contextMenu(): string | null
    {
        return 'MONSTERPLANT_SEED';
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/object/logic/furniture/_SafeCls_1723.as::getEventTypes()
    override getEventTypes(): string[]
    {
        return this.getAllEventTypes(super.getEventTypes(), [
            RoomObjectWidgetRequestEvent.ROWRE_MONSTERPLANT_SEED_PLANT_CONFIRMATION_DIALOG
        ]);
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/room/object/logic/furniture/_SafeCls_1723.as::useObject()
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

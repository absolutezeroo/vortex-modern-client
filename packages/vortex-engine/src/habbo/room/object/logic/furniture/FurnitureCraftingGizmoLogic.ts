/**
 * FurnitureCraftingGizmoLogic
 *
 * @see source_as_flash/com/sulake/habbo/room/object/logic/furniture/FurnitureCraftingGizmoLogic.as
 *
 * Logic for crafting gizmo furniture (widget = CRAFTING).
 */
import {FurnitureLogic} from './FurnitureLogic';
import {RoomObjectVariableEnum} from '@habbo/room/object/RoomObjectVariableEnum';

export class FurnitureCraftingGizmoLogic extends FurnitureLogic
{
    override get widget(): string | null
    {
        return 'CRAFTING';
    }

    override useObject(): void
    {
        super.useObject();
    }

    setAutomaticStateIndex(index: number): void
    {
        if(this.object === null)
        {
            return;
        }

        const model = this.object.getModelController();

        if(model !== null)
        {
            model.setNumber(RoomObjectVariableEnum.FURNITURE_AUTOMATIC_STATE_INDEX, index, false);
        }
    }
}

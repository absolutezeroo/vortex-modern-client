/**
 * FurnitureCustomStackHeightLogic
 *
 * @see source_as_flash/com/sulake/habbo/room/object/logic/furniture/FurnitureCustomStackHeightLogic.as
 *
 * Logic for custom stack height furniture (always stackable, widget = CUSTOM_STACK_HEIGHT).
 */
import {FurnitureMultiStateLogic} from './FurnitureMultiStateLogic';
import {RoomObjectVariableEnum} from '@habbo/room/object/RoomObjectVariableEnum';

export class FurnitureCustomStackHeightLogic extends FurnitureMultiStateLogic
{
	override get widget(): string | null
	{
		return 'CUSTOM_STACK_HEIGHT';
	}

	override initialize(data: unknown): void
	{
		super.initialize(data);

		if (this.object !== null && this.object.getModelController() !== null)
		{
			this.object.getModelController()!.setNumber(RoomObjectVariableEnum.FURNITURE_ALWAYS_STACKABLE, 1);
		}
	}
}

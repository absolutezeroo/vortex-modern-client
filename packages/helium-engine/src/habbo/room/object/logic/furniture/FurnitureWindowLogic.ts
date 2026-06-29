/**
 * FurnitureWindowLogic
 *
 * @see source_as_flash/com/sulake/habbo/room/object/logic/furniture/FurnitureWindowLogic.as
 *
 * Logic for window furniture (plane mask support).
 */
import {FurnitureMultiStateLogic} from './FurnitureMultiStateLogic';
import {RoomObjectVariableEnum} from '@habbo/room/object/RoomObjectVariableEnum';

export class FurnitureWindowLogic extends FurnitureMultiStateLogic
{
	override initialize(data: unknown): void
	{
		super.initialize(data);

		if (data === null)
		{
			return;
		}

		const config = data as { mask?: { type?: string } };

		if (config.mask?.type)
		{
			this.object?.getModelController()?.setNumber(RoomObjectVariableEnum.FURNITURE_USES_PLANE_MASK, 1, true);
			this.object?.getModelController()?.setString(RoomObjectVariableEnum.FURNITURE_PLANE_MASK_TYPE, config.mask.type, true);
		}
	}
}

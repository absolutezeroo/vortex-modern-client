/**
 * FurniturePlaceholderLogic
 *
 * Based on AS3: com.sulake.habbo.room.object.logic.furniture.FurniturePlaceholderLogic
 *
 * Logic for placeholder furniture (shown while loading real furniture).
 */
import {FurnitureLogic} from './FurnitureLogic';

export class FurniturePlaceholderLogic extends FurnitureLogic
{
	override getEventTypes(): string[]
	{
		// Placeholder furniture doesn't dispatch events
		return [];
	}

	override useObject(): void
	{
		// Placeholder furniture can't be used
	}
}

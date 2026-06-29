/**
 * FurnitureMysteryTrophyLogic
 *
 * @see source_as_win63/habbo/room/object/logic/furniture/FurnitureMysteryTrophyLogic.as
 *
 * Logic for mystery trophy furniture.
 */
import {FurnitureMultiStateLogic} from './FurnitureMultiStateLogic';
import {RoomObjectWidgetRequestEvent} from '@habbo/room/events/RoomObjectWidgetRequestEvent';

export class FurnitureMysteryTrophyLogic extends FurnitureMultiStateLogic
{
	override get contextMenu(): string | null
	{
		return 'MYSTERY_TROPHY';
	}

	override getEventTypes(): string[]
	{
		return this.getAllEventTypes(super.getEventTypes(), [
			RoomObjectWidgetRequestEvent.ROWRE_MYSTERYTROPHY_OPEN_DIALOG
		]);
	}

	override useObject(): void
	{
		if (this.eventDispatcher !== null && this.object !== null)
		{
			this.eventDispatcher.emit(
				RoomObjectWidgetRequestEvent.ROWRE_MYSTERYTROPHY_OPEN_DIALOG,
				new RoomObjectWidgetRequestEvent(RoomObjectWidgetRequestEvent.ROWRE_MYSTERYTROPHY_OPEN_DIALOG, this.object)
			);
		}
	}
}
